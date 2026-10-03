import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticate } from '../../middleware/authenticate.middleware';
import { authorize } from '../../middleware/authorize.middleware';

const router = Router();
router.use(authenticate);

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrder);

// Assume ADMIN only for confirmation and refunds
router.patch('/:id/confirm', authorize(['ADMIN']), ordersController.confirmOrder);
router.post('/:id/cancel', authorize(['ADMIN', 'CUSTOMER']), ordersController.cancelOrder);
router.post('/:id/refunds', authorize(['ADMIN']), ordersController.refundOrder);

export default router;