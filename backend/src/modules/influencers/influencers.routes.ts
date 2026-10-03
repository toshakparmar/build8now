import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate.middleware';
import { getBalance } from '../loyalty/loyalty.controller';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const data = await prisma.influencer.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/me', async (req, res, next) => {
  try {
    const data = await prisma.influencer.findUnique({ where: { userId: req.user!.id } });
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/me/balance', getBalance);

router.get('/me/ledger', async (req, res, next) => {
  try {
    const influencer = await prisma.influencer.findUnique({ where: { userId: req.user!.id } });
    if (!influencer) return res.status(404).json({ success: false });
    const data = await prisma.loyaltyLedger.findMany({ where: { influencerId: influencer.id } });
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;