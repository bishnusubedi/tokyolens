'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, BookmarkCheck, Lock } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { Header } from '@/components/layout/Header'
import { PhotoCard } from '@/components/photos/PhotoCard'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'
function imgUrl(url: string) { return url.startsWith('http') ? url : `${API_URL}${url}` }

type CollectionDetail = {
  id: string; name: string; description: string | null; isPrivate: boolean
  coverUrl: string | null; userId: string; itemCount: number
}

type CollectionItemRow = {
  id: string; photoId: string; savedAt: string
  photo: { id: string; title: string; imageUrl: string; thumbnailUrl: string | null; width: number; height: number; neighborhood: string; voteCount: number; author: { id: string; username: string; name: string; avatarUrl: string | null } }
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: photosData, isLoading } = useQuery({
    queryKey: queryKeys.collections.photos(id),
    queryFn: () => apiClient.get<{ data: CollectionItemRow[]; meta: { total: number } }>(`/api/collections/${id}/photos`),
    enabled: !!id,
  })

  const photos = photosData?.data ?? []
  const total = photosData?.meta.total ?? 0

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <BookmarkCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Board</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-8">{total} photo{total !== 1 ? 's' : ''}</p>

        {photos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No photos saved yet.</div>
        ) : (
          <div className="masonry">
            {photos.map((item, i) => (
              <PhotoCard key={item.id} photo={item.photo} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
