import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import * as ordersService from './orders.service';
import { ForbiddenError } from '../../common/errors';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.order.create({
      data: {
        ...req.body,
        customerId: req.user!.id,
      }
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = req.user!.role === 'ADMIN' ? {} : { customerId: req.user!.id };
    const orders = await prisma.order.findMany({ where });
    res.status(200).json({ success: true, data: orders });
  } catch (err) { next(err); }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } });
    if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found' }});
    if (req.user!.role !== 'ADMIN' && order.customerId !== req.user!.id) {
      throw new ForbiddenError('You do not have permission to view this order');
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) { next(err); }
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ordersService.confirmOrder(req.params.id as string);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  // Simplification for assignment
  try {
    const data = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { status: 'CANCELLED' }
    });
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const refundOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ordersService.refundOrderItems(req.params.id as string, req.body.refunds);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};