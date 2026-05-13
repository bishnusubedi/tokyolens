'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { PhotoCard } from '@/components/photos/PhotoCard'
import { PhotoGridSkeleton } from '@/components/photos/PhotoSkeleton'
import { useFeed } from '@/hooks/use-feed'

export default function FeedPage() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useFeed()
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '600px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const photos = data?.pages.flatMap((p) => p.data ?? []) ?? []

  return (
    <>
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 pt-6 pb-12">
        <h1 className="text-xl font-bold text-[#111] mb-6">Following</h1>

        {isLoading && <PhotoGridSkeleton />}

        {!isLoading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-2xl font-bold text-[#111] mb-3">Your feed is empty</p>
            <p className="text-[#767676] mb-8 max-w-sm">
              Follow photographers you love to see their latest shots here.
            </p>
            <Link href="/"
              className="px-6 py-3 rounded-full bg-[#e60023] text-white font-bold text-sm hover:bg-[#ad081b] transition-colors">
              Discover photographers
            </Link>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-[#767676]">Something went wrong loading your feed.</p>
          </div>
        )}

        {photos.length > 0 && (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-x-4">
              {photos.map((photo, i) => (
                <div key={photo.id} className="break-inside-avoid mb-4">
                  <PhotoCard photo={photo} priority={i < 10} />
                </div>
              ))}
            </div>
            <div ref={sentinel} className="h-8 mt-2" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <div className="h-7 w-7 rounded-full border-[3px] border-[#e60023] border-t-transparent animate-spin" />
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
