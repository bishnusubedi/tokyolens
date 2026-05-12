import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashPassword('user123'),
      role: 'USER',
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: 'Hello World',
        content: 'This is the first post.',
        status: 'PUBLISHED',
        authorId: admin.id,
      },
      {
        title: 'Getting Started',
        content: 'A guide to getting started with this app.',
        status: 'PUBLISHED',
        authorId: user.id,
      },
      {
        title: 'Draft Post',
        content: 'This post is still a draft.',
        status: 'DRAFT',
        authorId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.', { admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
