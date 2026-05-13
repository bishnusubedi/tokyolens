import { Suspense } from 'react'
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
      <ChampionHero award={champion as Parameters<typeof ChampionHero>[0]['award']} />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<PhotoGridSkeleton />}>
          <PhotoFeed />
        </Suspense>
      </main>
    </>
  )
}
