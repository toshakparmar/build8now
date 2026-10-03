import { z } from 'zod';

export const createShippingProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    minimumCharge: z.number().nonnegative().optional(),
    maximumCharge: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateShippingProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    minimumCharge: z.number().nonnegative().optional(),
    maximumCharge: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createShippingRuleSchema = z.object({
  body: z.object({
    metric: z.enum(['WEIGHT', 'QUANTITY', 'PRICE', 'DISTANCE', 'LENGTH', 'WIDTH', 'HEIGHT', 'VOLUME', 'AREA']),
    calculationType: z.enum(['FLAT', 'PER_UNIT', 'SLAB', 'PERCENTAGE']),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    rate: z.number().nonnegative().optional(),
    fixedCharge: z.number().nonnegative().optional(),
    priority: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const calculateShippingSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    distance: z.number().nonnegative().optional(),
    weight: z.number().nonnegative().optional(),
    length: z.number().nonnegative().optional(),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
  }),
});