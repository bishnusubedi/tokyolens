import { Suspense } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { ChampionHero } from '@/components/awards/ChampionHero'
import { PhotoFeed } from '@/components/photos/PhotoFeed'
import { PhotoGridSkeleton } from '@/components/photos/PhotoSkeleton'
import { apiClient } from '@/lib/api-client'

async function getChampion() {
  try {
    const res = await apiClient.get<{ data: unknown }>('/api/awards/champion')
    return res.data
  } catch {
    return null
  }
}

export default async function HomePage() {
  const champion = await getChampion()

  return (
    <>
      <Header />

      {/* Hero section */}
      <section className="bg-[#fbfbf9] pt-20 pb-16 px-4 text-center">
        <div className="max-w-[760px] mx-auto">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#f6f6f3] text-xs font-bold uppercase tracking-widest text-[#62625b]">
            Tokyo Photography Community
          </span>
          <h1
            className="text-[clamp(2.5rem,8vw,4.375rem)] font-bold leading-[1.1] tracking-display text-black mb-6 font-display"
            style={{ fontFamily: "'Manrope', var(--font-inter), sans-serif", letterSpacing: '-0.075rem' }}
          >
            Discover Tokyo<br className="hidden sm:block" /> through the lens
          </h1>
          <p className="text-lg text-[#62625b] mb-10 max-w-[520px] mx-auto leading-relaxed">
            A curated community for photographers capturing the city&apos;s soul — from neon-lit alleyways to serene temple gardens.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#feed"
              className="inline-flex items-center justify-center px-8 py-3 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] transition-colors"
            >
              Start exploring
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-[16px] bg-[#e5e5e0] text-black text-sm font-bold hover:bg-[#c8c8c1] transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </section>

      {/* Weekly champion */}
      {champion && (
        <ChampionHero award={champion as Parameters<typeof ChampionHero>[0]['award']} />
      )}

      {/* Photo feed */}
      <main id="feed" className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <h2
            className="text-[28px] font-bold text-black"
            style={{ fontFamily: "'Manrope', var(--font-inter), sans-serif", letterSpacing: '-0.05rem' }}
          >
            Latest shots
          </h2>
        </div>
        <Suspense fallback={<PhotoGridSkeleton />}>
          <PhotoFeed />
        </Suspense>
      </main>

      {/* Dark CTA strip */}
      <section className="bg-[#262622] text-white py-16 px-4 mt-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2
              className="text-[28px] font-bold"
              style={{ fontFamily: "'Manrope', var(--font-inter), sans-serif" }}
            >
              Share your perspective
            </h2>
            <p className="text-[rgba(255,255,255,0.7)] mt-1 text-sm">
              Every great shot deserves an audience. Join thousands of Tokyo photographers.
            </p>
          </div>
          <Link
            href="/upload"
            className="flex-shrink-0 inline-flex items-center justify-center px-8 py-3 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] transition-colors"
          >
            Upload a photo
          </Link>
        </div>
      </section>
    </>
  )
}
