import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import shippingRoutes from '../modules/shipping/shipping.routes';
import productsRoutes from '../modules/products/products.routes';
import ordersRoutes from '../modules/orders/orders.routes';
import influencersRoutes from '../modules/influencers/influencers.routes';
import referralsRoutes from '../modules/referrals/referrals.routes';
import loyaltyRoutes from '../modules/loyalty/loyalty.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/shipping', shippingRoutes); // contains /calculate and /shipping-profiles logic from earlier setup
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/influencers', influencersRoutes);
router.use('/referrals', referralsRoutes);
router.use('/loyalty-rules', loyaltyRoutes);

export default router;