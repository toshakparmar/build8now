import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
    ...(process.env.NODE_ENV === 'development'
      ? [{ emit: 'stdout' as const, level: 'query' as const }]
      : []),
  ],
});

export default prisma;