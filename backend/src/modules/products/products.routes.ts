import { Router } from 'express';
import * as productsController from './products.controller';
import { authenticate } from '../../middleware/authenticate.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProduct);

router.use(authenticate);
router.use(authorize(['ADMIN']));
router.put('/:id/shipping-profile', productsController.assignShippingProfile);

export default router;