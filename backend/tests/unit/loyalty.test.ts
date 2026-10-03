import { processOrderLoyalty } from '../../src/modules/loyalty/loyalty.service';
import prisma from '../../src/lib/prisma';
import { Prisma } from '@prisma/client';

jest.mock('../../src/lib/prisma', () => ({
  order: { findUnique: jest.fn() },
  customerInfluencerReferral: { findUnique: jest.fn() },
  loyaltyRule: { findMany: jest.fn() },
  loyaltyLedger: { findUnique: jest.fn(), create: jest.fn() },
}));

describe('Loyalty Engine Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should award points based on product precedence over category', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'ord-123',
      customerId: 'cust-1',
      orderItems: [
        { id: 'item-1', productId: 'prod-1', lineTotal: new Prisma.Decimal(500), product: { categoryId: 'cat-1' } }
      ]
    });

    (prisma.customerInfluencerReferral.findUnique as jest.Mock).mockResolvedValue({
      influencerId: 'inf-1'
    });

    (prisma.loyaltyRule.findMany as jest.Mock).mockResolvedValue([
      { scopeType: 'PRODUCT', productId: 'prod-1', pointsType: 'FIXED', pointsValue: new Prisma.Decimal(100) },
      { scopeType: 'CATEGORY', categoryId: 'cat-1', pointsType: 'FIXED', pointsValue: new Prisma.Decimal(50) }
    ]);

    (prisma.loyaltyLedger.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.loyaltyLedger.create as jest.Mock).mockResolvedValue({ id: 'ledger-1', points: new Prisma.Decimal(100) });

    const result = await processOrderLoyalty('ord-123', prisma as any);

    expect(result.status).toBe('PROCESSED');
    expect(result.totalAwarded!.toString()).toBe("100"); // Proves product precedence
    expect(prisma.loyaltyLedger.create).toHaveBeenCalled();
  });
});