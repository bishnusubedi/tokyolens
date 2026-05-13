'use client'

import { useEffect, useRef } from 'react'
import { usePhotos } from '@/hooks/use-photos'
import { PhotoCard } from './PhotoCard'
import { PhotoGridSkeleton } from './PhotoSkeleton'
import type { PhotoQuery } from '@repo/shared'

interface MasonryGridProps {
  params?: Partial<PhotoQuery>
}

export function MasonryGrid({ params }: MasonryGridProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePhotos(params)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '600px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <PhotoGridSkeleton />

  const photos = data?.pages.flatMap((p) => p.data ?? []) ?? []

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#767676]">
        <p className="text-xl font-bold mb-2">Nothing here yet</p>
        <p className="text-sm">Be the first to share a photo!</p>
      </div>
    )
  }

  return (
    <>
      {/* Pinterest-style columns masonry */}
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
  )
}
