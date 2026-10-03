import { calculateShipping } from '../../src/modules/shipping/shipping.service';
import prisma from '../../src/lib/prisma';
import { Prisma } from '@prisma/client';

jest.mock('../../src/lib/prisma', () => ({
  product: {
    findUnique: jest.fn(),
  },
}));

describe('Shipping Engine Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate multiple additive rules correctly', async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({
      id: 'prod-123',
      price: new Prisma.Decimal(100),
      shippingProfile: {
        id: 'prof-1',
        isActive: true,
        minimumCharge: new Prisma.Decimal(50),
        maximumCharge: new Prisma.Decimal(200),
        rules: [
          { metric: 'WEIGHT', calculationType: 'PER_UNIT', rate: new Prisma.Decimal(5), isActive: true },
          { metric: 'DISTANCE', calculationType: 'SLAB', minValue: new Prisma.Decimal(0), maxValue: new Prisma.Decimal(10), fixedCharge: new Prisma.Decimal(30), isActive: true }
        ]
      }
    });

    const result = await calculateShipping({
      productId: 'prod-123',
      quantity: 1,
      weight: 4,     // 4 * 5 = 20
      distance: 5    // 5 falls in 0-10 slab = 30
    });                  // Total should be 50

    expect(result.subtotal).toBe("50.00");
    expect(result.total).toBe("50.00");
    expect(result.rules.length).toBe(2);
  });

  it('should apply maximum and minimum limits', async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({
      id: 'prod-123',
      price: new Prisma.Decimal(100),
      shippingProfile: {
        id: 'prof-1',
        isActive: true,
        minimumCharge: new Prisma.Decimal(100),
        maximumCharge: new Prisma.Decimal(300),
        rules: [
          { metric: 'WEIGHT', calculationType: 'FLAT', fixedCharge: new Prisma.Decimal(10), isActive: true },
        ]
      }
    });

    const resultMin = await calculateShipping({
      productId: 'prod-123',
      quantity: 1,
      weight: 4, 
    });

    expect(resultMin.subtotal).toBe("10.00");
    expect(resultMin.minimumAdjustment).toBe("90.00");
    expect(resultMin.total).toBe("100.00");
  });
});