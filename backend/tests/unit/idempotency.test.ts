import { processOrderLoyalty } from '../../src/modules/loyalty/loyalty.service';
import prisma from '../../src/lib/prisma';
import { Prisma } from '@prisma/client';

jest.mock('../../src/lib/prisma', () => ({
  order: { findUnique: jest.fn() },
  customerInfluencerReferral: { findUnique: jest.fn() },
  loyaltyRule: { findMany: jest.fn() },
  loyaltyLedger: { findUnique: jest.fn(), create: jest.fn() },
}));

describe('Loyalty Idempotency', () => {
  it('should not award duplicate points if idempotency key exists', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'ord-123',
      customerId: 'cust-1',
      orderItems: [{ id: 'item-1', productId: 'prod-1', lineTotal: new Prisma.Decimal(500), product: { categoryId: 'cat-1' } }]
    });

    (prisma.customerInfluencerReferral.findUnique as jest.Mock).mockResolvedValue({ influencerId: 'inf-1' });

    (prisma.loyaltyRule.findMany as jest.Mock).mockResolvedValue([
      { scopeType: 'DEFAULT', pointsType: 'FIXED', pointsValue: new Prisma.Decimal(100) }
    ]);

    // Mock that the ledger entry already exists!
    (prisma.loyaltyLedger.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-ledger', points: new Prisma.Decimal(100) });

    const result = await processOrderLoyalty('ord-123', prisma as any);

    expect(result.totalAwarded!.toString()).toBe("0"); 
    expect(prisma.loyaltyLedger.create).not.toHaveBeenCalled(); // Should not create a new entry
  });
});