import { z } from 'zod';

export const createLoyaltyRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    scopeType: z.enum(['PRODUCT', 'CATEGORY', 'DEFAULT']),
    productId: z.string().uuid().nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    minPurchaseValue: z.number().nonnegative().optional(),
    maxPurchaseValue: z.number().nonnegative().optional(),
    pointsType: z.enum(['FIXED', 'PER_CURRENCY_AMOUNT', 'PERCENTAGE']),
    pointsValue: z.number().nonnegative(),
    priority: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});