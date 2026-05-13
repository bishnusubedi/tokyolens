import app from './app.js'
import { prisma } from '@repo/database'
import { ImageService } from './infrastructure/services/ImageService.js'
import { AwardScheduler } from './infrastructure/scheduler/AwardScheduler.js'
import { PrismaAwardRepository } from './infrastructure/repositories/PrismaAwardRepository.js'
import { PrismaVoteRepository } from './infrastructure/repositories/PrismaVoteRepository.js'

const PORT = Number(process.env['API_PORT'] ?? 3001)

async function main() {
  await prisma.$connect()
  console.log('Database connected')

  await ImageService.ensureUploadsDir()

  const awardScheduler = new AwardScheduler(
    new PrismaAwardRepository(prisma),
    new PrismaVoteRepository(prisma),
  )
  awardScheduler.start()

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
