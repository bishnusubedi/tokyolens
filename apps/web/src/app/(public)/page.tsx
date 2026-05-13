import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { PhotoFeed } from '@/components/photos/PhotoFeed'
import { PhotoGridSkeleton } from '@/components/photos/PhotoSkeleton'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 pt-4 pb-12">
        <Suspense fallback={<PhotoGridSkeleton />}>
          <PhotoFeed />
        </Suspense>
      </main>
    </>
  )
}
