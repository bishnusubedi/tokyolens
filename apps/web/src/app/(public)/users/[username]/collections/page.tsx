'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { BookmarkCheck, ChevronLeft } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { Header } from '@/components/layout/Header'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'
function imgUrl(url: string) { return url.startsWith('http') ? url : `${API_URL}${url}` }

type CollectionRow = { id: string; name: string; coverUrl: string | null; itemCount: number; userId: string }

export default function UserCollectionsPage() {
  const { username } = useParams<{ username: string }>()

  const { data: profileData } = useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => apiClient.get<{ data: { id: string; name: string } }>(`/api/users/${username}`),
    enabled: !!username,
  })

  const userId = profileData?.data?.id

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.collections.byUser(userId ?? ''),
    queryFn: () => apiClient.get<{ data: CollectionRow[] }>(`/api/collections/user/${userId}`),
    enabled: !!userId,
  })

  const collections = data?.data ?? []
  const userName = profileData?.data?.name ?? username

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href={`/users/${username}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to {userName}
        </Link>

        <h1 className="text-2xl font-bold mb-1">{userName}'s Boards</h1>
        <p className="text-muted-foreground text-sm mb-8">{collections.length} public board{collections.length !== 1 ? 's' : ''}</p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No public boards.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {collections.map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`} className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {col.coverUrl ? (
                    <Image
                      src={imgUrl(col.coverUrl)}
                      alt={col.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookmarkCheck className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{col.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{col.itemCount} photo{col.itemCount !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
