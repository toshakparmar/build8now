import { Request, Response, NextFunction } from 'express';
import * as loyaltyService from './loyalty.service';

export const createLoyaltyRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await loyaltyService.createLoyaltyRule(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getLoyaltyRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await loyaltyService.getLoyaltyRules();
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const influencerId = req.user?.id; // Assuming user.id corresponds to influencer.userId, wait, need to fetch influencerId
    // For simplicity in this controller, we fetch influencer by userId:
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const influencer = await prisma.influencer.findUnique({ where: { userId: req.user!.id } });
    if (!influencer) return res.status(404).json({ success: false, error: { message: "Influencer not found" } });
    
    const balance = await loyaltyService.getInfluencerBalance(influencer.id);
    res.status(200).json({ success: true, data: { balance } });
  } catch (err) { next(err); }
};