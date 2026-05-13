import cron from 'node-cron'
import { startOfWeek, subDays, startOfMonth, subMonths, endOfMonth } from 'date-fns'
import type { IAwardRepository, IVoteRepository } from '../../domain/repositories/IPostRepository.js'

export class AwardScheduler {
  constructor(
    private readonly awardRepo: IAwardRepository,
    private readonly voteRepo: IVoteRepository,
  ) {}

  start() {
    // Weekly: every Monday 00:05 JST (UTC+9 = Sunday 15:05 UTC)
    cron.schedule('5 15 * * 0', () => this.runWeekly(), { timezone: 'UTC' })

    // Monthly: 1st of month 00:10 JST (UTC+9 = previous day 15:10 UTC)
    cron.schedule('10 15 28-31 * *', () => {
      const now = new Date()
      if (new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate()) {
        this.runMonthly()
      }
    }, { timezone: 'UTC' })

    // Run on startup to populate hero section
    this.runWeekly().catch(() => {})
    this.runMonthly().catch(() => {})
  }

  async runWeekly() {
    try {
      const now = new Date()
      const thisMonday = startOfWeek(now, { weekStartsOn: 1 })
      const periodEnd = thisMonday
      const periodStart = subDays(periodEnd, 7)

      const results = await this.voteRepo.aggregateByPeriod(periodStart, periodEnd, 1)
      if (results.length === 0) return

      const top = results[0]!
      await this.awardRepo.upsert({
        type: 'WEEKLY_WINNER',
        photoId: top.photoId,
        userId: top.authorId,
        periodStart,
        periodEnd,
        voteCount: top.voteCount,
      })
    } catch (err) {
      console.error('[AwardScheduler] Weekly calculation failed:', err)
    }
  }

  async runMonthly() {
    try {
      const now = new Date()
      const periodStart = startOfMonth(subMonths(now, 1))
      const periodEnd = new Date(endOfMonth(subMonths(now, 1)).getTime() + 1)

      const results = await this.voteRepo.aggregateByPeriod(periodStart, periodEnd, 1)
      if (results.length === 0) return

      const top = results[0]!
      await this.awardRepo.upsert({
        type: 'MONTHLY_WINNER',
        photoId: top.photoId,
        userId: top.authorId,
        periodStart,
        periodEnd,
        voteCount: top.voteCount,
      })
    } catch (err) {
      console.error('[AwardScheduler] Monthly calculation failed:', err)
    }
  }
}
