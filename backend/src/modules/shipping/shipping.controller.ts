import { Request, Response, NextFunction } from 'express';
import * as shippingService from './shipping.service';

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.createProfile(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.getProfiles();
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.getProfile(req.params.id as string);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.updateProfile(req.params.id as string, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const deactivateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.deactivateProfile(req.params.id as string);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const createRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.createRule(req.params.id as string, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const calculateShipping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shippingService.calculateShipping(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};