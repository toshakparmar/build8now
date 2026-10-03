import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import prisma from './lib/prisma';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const connectWithRetry = async (attempt = 1): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully.');
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      logger.warn(
        `Database connection failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(attempt + 1);
    }
    logger.error(
      { err: error },
      `Database connection failed after ${MAX_RETRIES} attempts.\n` +
        '  → Check that your Supabase project is not paused (https://supabase.com/dashboard)\n' +
        '  → Verify DATABASE_URL and DIRECT_URL in .env are correct\n' +
        '  → Run: Test-NetConnection -ComputerName aws-0-ap-northeast-1.pooler.supabase.com -Port 6543'
    );
    throw error;
  }
};

const startServer = async () => {
  try {
    await connectWithRetry();

    app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected. Process exiting.');
  process.exit(0);
});
// Trigger nodemon restart for .env update

// Trigger nodemon restart for swagger update

// Trigger nodemon restart for Prisma connection_limit update
