import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../common/errors';
import { Role } from '@prisma/client';

export const authorize = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }
      
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};