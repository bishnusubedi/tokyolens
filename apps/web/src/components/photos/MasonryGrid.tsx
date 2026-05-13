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
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <PhotoGridSkeleton />

  const photos = data?.pages.flatMap((p) => p.data ?? []) ?? []

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No photos yet. Be the first to share!
      </div>
    )
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2">
        {photos.map((photo, i) => (
          <div key={photo.id} className="break-inside-avoid mb-2">
            <PhotoCard photo={photo} priority={i < 6} />
          </div>
        ))}
      </div>
      <div ref={sentinel} className="h-8 mt-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 rounded-full border-2 border-[#e60023] border-t-transparent animate-spin" />
        </div>
      )}
    </>
  )
}
