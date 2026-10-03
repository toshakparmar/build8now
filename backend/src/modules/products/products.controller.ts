import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { NotFoundError } from '../../common/errors';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json({ success: true, data: products });
  } catch (err) { next(err); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product) throw new NotFoundError('Product not found');
    res.status(200).json({ success: true, data: product });
  } catch (err) { next(err); }
};

export const assignShippingProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shippingProfileId } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: { shippingProfileId },
    });
    res.status(200).json({ success: true, data: product });
  } catch (err) { next(err); }
};