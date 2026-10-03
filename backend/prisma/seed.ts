import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@build8now.com' },
    update: {},
    create: {
      email: 'admin@build8now.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const customerPass = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@build8now.com' },
    update: {},
    create: {
      email: 'customer@build8now.com',
      passwordHash: customerPass,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  });

  const influencerPass = await bcrypt.hash('influencer123', 10);
  const influencerUser = await prisma.user.upsert({
    where: { email: 'influencer@build8now.com' },
    update: {},
    create: {
      email: 'influencer@build8now.com',
      passwordHash: influencerPass,
      firstName: 'Jane',
      lastName: 'Architect',
      role: 'INFLUENCER',
    },
  });

  const influencer = await prisma.influencer.upsert({
    where: { userId: influencerUser.id },
    update: {},
    create: {
      userId: influencerUser.id,
      type: 'ARCHITECT',
    },
  });

  // Seed Category
  const category = await prisma.category.upsert({
    where: { slug: 'cement' },
    update: {},
    create: {
      name: 'Cement',
      slug: 'cement',
    },
  });

  // Seed Shipping Profile
  const profile = await prisma.shippingProfile.create({
    data: {
      name: 'Standard Heavy Goods',
      minimumCharge: 50,
      maximumCharge: 500,
      rules: {
        create: [
          {
            metric: 'WEIGHT',
            calculationType: 'PER_UNIT',
            rate: 2,
            priority: 1,
          },
          {
            metric: 'DISTANCE',
            calculationType: 'SLAB',
            minValue: 0,
            maxValue: 50,
            fixedCharge: 100,
            priority: 1,
          }
        ]
      }
    }
  });

  // Seed Product
  const product = await prisma.product.upsert({
    where: { slug: 'ultratech-premium-cement-50kg' },
    update: {},
    create: {
      name: 'UltraTech Premium Cement 50kg',
      slug: 'ultratech-premium-cement-50kg',
      price: 450.0,
      categoryId: category.id,
      shippingProfileId: profile.id,
      defaultWeight: 50.0,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
