import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const data = await prisma.customerInfluencerReferral.create({ data: req.body });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;