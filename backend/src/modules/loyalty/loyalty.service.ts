import prisma from '../../lib/prisma';
import { NotFoundError, ConflictError } from '../../common/errors';
import { Prisma } from '@prisma/client';

export const createLoyaltyRule = async (data: any) => {
  return prisma.loyaltyRule.create({ data });
};

export const getLoyaltyRules = async () => {
  return prisma.loyaltyRule.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
};

export const processOrderLoyalty = async (orderId: string, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        include: {
          influencer: true, // check if customer themselves is influencer? no, we check referrals
        }
      },
      orderItems: { include: { product: true } }
    },
  });

  if (!order) throw new NotFoundError('Order not found');

  const referral = await db.customerInfluencerReferral.findUnique({
    where: { customerId: order.customerId },
  });

  if (!referral) return { status: 'NO_REFERRAL' }; // No influencer to award points to

  const activeRules = await db.loyaltyRule.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' }
  });

  let totalAwarded = new Prisma.Decimal(0);
  const ledgerEntries = [];

  for (const item of order.orderItems) {
    const productRule = activeRules.find(r => r.scopeType === 'PRODUCT' && r.productId === item.productId);
    const categoryRule = activeRules.find(r => r.scopeType === 'CATEGORY' && r.categoryId === item.product.categoryId);
    const defaultRule = activeRules.find(r => r.scopeType === 'DEFAULT');

    const applicableRule = productRule || categoryRule || defaultRule;

    if (applicableRule) {
      let pointsToAward = new Prisma.Decimal(0);
      const lineTotal = new Prisma.Decimal(item.lineTotal);

      if (applicableRule.pointsType === 'FIXED') {
        pointsToAward = new Prisma.Decimal(applicableRule.pointsValue);
      } else if (applicableRule.pointsType === 'PER_CURRENCY_AMOUNT') {
        pointsToAward = lineTotal.mul(applicableRule.pointsValue);
      } else if (applicableRule.pointsType === 'PERCENTAGE') {
        pointsToAward = lineTotal.mul(applicableRule.pointsValue).div(100);
      }

      if (pointsToAward.gt(0)) {
        const idempotencyKey = `EARN:${order.id}:${item.id}:${referral.influencerId}`;
        
        // Ensure idempotency for each item
        const existingLedger = await db.loyaltyLedger.findUnique({ where: { idempotencyKey } });
        
        if (!existingLedger) {
          const entry = await db.loyaltyLedger.create({
            data: {
              influencerId: referral.influencerId,
              orderId: order.id,
              orderItemId: item.id,
              transactionType: 'EARN',
              points: pointsToAward,
              idempotencyKey,
              description: `Points earned for order ${order.id} item ${item.id}`
            }
          });
          ledgerEntries.push(entry);
          totalAwarded = totalAwarded.add(pointsToAward);
        }
      }
    }
  }

  return { status: 'PROCESSED', totalAwarded, ledgerEntries };
};

export const getInfluencerBalance = async (influencerId: string) => {
  const result = await prisma.loyaltyLedger.aggregate({
    where: { influencerId },
    _sum: { points: true }
  });
  
  return result._sum.points || new Prisma.Decimal(0);
};

export const reversePointsForRefund = async (orderItemId: string, refundQuantity: number, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  
  const earnEntry = await db.loyaltyLedger.findFirst({
    where: { orderItemId, transactionType: 'EARN' },
  });

  if (!earnEntry) return null;

  const orderItem = await db.orderItem.findUnique({ where: { id: orderItemId } });
  if (!orderItem) throw new NotFoundError('Order Item not found');

  // calculate fractional point reversal based on the refund quantity vs purchased quantity
  const fraction = new Prisma.Decimal(refundQuantity).div(orderItem.quantity);
  const pointsToReverse = earnEntry.points.mul(fraction).mul(-1); // Make it negative

  const idempotencyKey = `REVERSAL:${orderItemId}:${Date.now()}`; // unique based on time to allow multiple partial refunds
  
  const reversalEntry = await db.loyaltyLedger.create({
    data: {
      influencerId: earnEntry.influencerId,
      orderId: earnEntry.orderId,
      orderItemId,
      transactionType: 'REVERSAL',
      points: pointsToReverse,
      relatedLedgerId: earnEntry.id,
      idempotencyKey,
      description: `Reversal for partial/full refund on item ${orderItemId}`
    }
  });

  return reversalEntry;
};