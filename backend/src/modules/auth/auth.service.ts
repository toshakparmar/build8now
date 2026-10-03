import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../common/errors';

export const register = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'CUSTOMER',
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  });
  
  return user;
};

export const login = async (data: any) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  const decodedRefresh = jwt.decode(refreshToken) as any;

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(decodedRefresh.exp * 1000),
    },
  });

  return {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const newAccessToken = jwt.sign(
      { id: session.user.id, email: session.user.email, role: session.user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );

    return { accessToken: newAccessToken };
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

export const logout = async (refreshToken: string) => {
  await prisma.session.deleteMany({
    where: { refreshToken },
  });
  return true;
};