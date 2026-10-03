import prisma from '../../lib/prisma';
import { NotFoundError, BusinessRuleError, ConflictError } from '../../common/errors';
import { processOrderLoyalty, reversePointsForRefund } from '../loyalty/loyalty.service';

export const confirmOrder = async (orderId: string) => {
  // Confirm and process loyalty atomically
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found');
    if (order.status !== 'PENDING') throw new ConflictError('Order is already confirmed or processed');

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    });

    const loyaltyResult = await processOrderLoyalty(orderId, tx);

    return { order: updatedOrder, loyaltyResult };
  });
};

export const refundOrderItems = async (orderId: string, refunds: { orderItemId: string, quantity: number }[]) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
    if (!order) throw new NotFoundError('Order not found');
    
    let allRefunded = true;
    for (const r of refunds) {
      const item = order.orderItems.find(i => i.id === r.orderItemId);
      if (!item) throw new NotFoundError(`Order Item ${r.orderItemId} not found`);
      
      const newRefundedQty = item.refundedQuantity + r.quantity;
      if (newRefundedQty > item.quantity) {
        throw new BusinessRuleError('OVER_REFUND', `Cannot refund more than purchased quantity for item ${item.id}`);
      }

      await tx.orderItem.update({
        where: { id: item.id },
        data: { refundedQuantity: newRefundedQty }
      });
      
      if (newRefundedQty < item.quantity) allRefunded = false;
      
      // Reverse loyalty points
      await reversePointsForRefund(item.id, r.quantity, tx);
    }
    
    await tx.order.update({
      where: { id: orderId },
      data: { status: allRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED' }
    });

    return { success: true };
  });
};