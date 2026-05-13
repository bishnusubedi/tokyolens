import bcryptjs from 'bcryptjs'
const { hash } = bcryptjs
import { prisma } from '../src/index.js'


async function main() {
  console.log('Seeding database...')

  // Forum categories
  const categories = [
    { slug: 'EQUIPMENT_REVIEWS', name: 'Equipment Reviews', description: 'Cameras, lenses, and gear discussion', sortOrder: 0 },
    { slug: 'TOKYO_PHOTO_SPOTS', name: 'Tokyo Photo Spots', description: 'Discover the best shooting locations in Tokyo', sortOrder: 1 },
    { slug: 'CRITIQUE_MY_WORK', name: 'Critique My Work', description: 'Share your photos and get constructive feedback', sortOrder: 2 },
    { slug: 'GENERAL', name: 'General Discussion', description: 'Photography talk and community chat', sortOrder: 3 },
  ]

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug as any },
      update: {},
      create: cat as any,
    })
  }

  // Admin user
  const adminPassword = await hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tokyolens.jp' },
    update: { password: adminPassword },
    create: {
      email: 'admin@tokyolens.jp',
      username: 'admin',
      name: 'Tokyo Lens Admin',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  })

  // Demo photographer
  const demoPassword = await hash('demo123456', 12)
  await prisma.user.upsert({
    where: { email: 'demo@tokyolens.jp' },
    update: { password: demoPassword },
    create: {
      email: 'demo@tokyolens.jp',
      username: 'sakura_shots',
      name: 'Sakura Yamamoto',
      password: demoPassword,
      role: 'USER',
      bio: 'Street photographer based in Shinjuku. Capturing Tokyo one frame at a time.',
      location: 'Shinjuku, Tokyo',
    },
  })

  console.log('Seed complete.', { admin: admin.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
