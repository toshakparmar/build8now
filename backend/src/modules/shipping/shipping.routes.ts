import { Router } from 'express';
import * as shippingController from './shipping.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/authenticate.middleware';
import { authorize } from '../../middleware/authorize.middleware';
import {
  createShippingProfileSchema,
  updateShippingProfileSchema,
  createShippingRuleSchema,
  calculateShippingSchema,
} from './shipping.validation';

const router = Router();

// Calculate shipping (accessible by authenticated users, or open if required, assuming open for calculation)
router.post('/calculate', validate(calculateShippingSchema), shippingController.calculateShipping);

// Admin-only Profile Management
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/shipping-profiles', validate(createShippingProfileSchema), shippingController.createProfile);
router.get('/shipping-profiles', shippingController.getProfiles);
router.get('/shipping-profiles/:id', shippingController.getProfile);
router.patch('/shipping-profiles/:id', validate(updateShippingProfileSchema), shippingController.updateProfile);
router.patch('/shipping-profiles/:id/deactivate', shippingController.deactivateProfile);

router.post('/shipping-profiles/:id/rules', validate(createShippingRuleSchema), shippingController.createRule);

export default router;