import { Router } from 'express';
import * as loyaltyController from './loyalty.controller';
import { authenticate } from '../../middleware/authenticate.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', loyaltyController.createLoyaltyRule);
router.get('/', loyaltyController.getLoyaltyRules);

export default router;