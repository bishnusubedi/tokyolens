'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MapPin, Globe, Instagram, Trophy, Camera, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { Header } from '@/components/layout/Header'
import { PhotoCard } from '@/components/photos/PhotoCard'
import { FollowButton } from '@/components/users/FollowButton'
import type { ApiResponse, CursorResponse, FollowStats } from '@repo/shared'
import type { UserPublic } from '@repo/shared'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

type AwardWithPhoto = {
  id: string
  type: string
  voteCount: number
  periodStart: string
  photo: { id: string; title: string; thumbnailUrl: string | null; imageUrl: string; neighborhood: string; author: { username: string; name: string; avatarUrl: string | null } }
}

type PhotoWithAuthor = {
  id: string; title: string; imageUrl: string; thumbnailUrl: string | null
  width: number; height: number; neighborhood: string; voteCount: number
  hasVoted?: boolean; createdAt: string
  author: { id: string; username: string; name: string; avatarUrl: string | null; role: string }
}

type ProfileResponse = UserPublic & FollowStats

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()

  const { data: profileData, isLoading } = useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => apiClient.get<ApiResponse<ProfileResponse>>(`/api/users/${username}`),
    enabled: !!username,
  })

  const { data: galleryData } = useQuery({
    queryKey: queryKeys.users.gallery(username),
    queryFn: () => apiClient.get<CursorResponse<PhotoWithAuthor>>(`/api/users/${username}/photos?limit=20&page=1`),
    enabled: !!username,
  })

  const { data: awardsData } = useQuery({
    queryKey: queryKeys.users.awards(username),
    queryFn: () => apiClient.get<ApiResponse<AwardWithPhoto[]>>(`/api/users/${username}/awards`),
    enabled: !!username,
  })

  const user = profileData?.data
  const photos = galleryData?.data ?? []
  const awards = awardsData?.data ?? []

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

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">User not found.</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start gap-6 mb-8">
          <div className="h-20 w-20 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.avatarUrl
              ? <Image src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_URL}${user.avatarUrl}`} alt={user.name} width={80} height={80} className="object-cover" />
              : user.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {awards.length > 0 && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                  <Trophy className="h-3 w-3" />
                  {awards.length} award{awards.length !== 1 ? 's' : ''}
                </div>
              )}
              <FollowButton username={user.username} isFollowing={user.isFollowing} userId={user.id} />
            </div>
            <p className="text-muted-foreground text-sm">@{user.username}</p>

            {/* Follow stats */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <Link href={`/users/${user.username}/followers`} className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="font-semibold">{user.followerCount ?? 0}</span>
                <span className="text-muted-foreground">followers</span>
              </Link>
              <Link href={`/users/${user.username}/following`} className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="font-semibold">{user.followingCount ?? 0}</span>
                <span className="text-muted-foreground">following</span>
              </Link>
            </div>

            {user.bio && <p className="text-sm mt-2 max-w-xl">{user.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.location}
                </span>
              )}
              {user.websiteUrl && (
                <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              {user.instagramUrl && (
                <a href={`https://instagram.com/${user.instagramUrl.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {awards.length > 0 && (
          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              Trophy Case
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {awards.map((award) => {
                const src = (award.photo.thumbnailUrl ?? award.photo.imageUrl)
                return (
                  <Link key={award.id} href={`/photos/${award.photo.id}`} className="group relative rounded-lg overflow-hidden border border-primary/20 bg-card hover:border-primary/50 transition-colors">
                    <Image
                      src={src.startsWith('http') ? src : `${API_URL}${src}`}
                      alt={award.photo.title}
                      width={200}
                      height={150}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-2">
                      <div className="flex items-center gap-1 text-primary text-xs font-medium">
                        <Trophy className="h-3 w-3" />
                        {award.type === 'WEEKLY_WINNER' ? 'Weekly' : 'Monthly'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{award.photo.title}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Camera className="h-5 w-5 text-primary" />
            Photos ({photos.length})
          </h2>
          {photos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No photos yet.</p>
          ) : (
            <div className="masonry">
              {photos.map((photo, i) => (
                <PhotoCard key={photo.id} photo={photo} priority={i < 4} />
              ))}
            </div>
          )}
        </section>

        {/* Collections section link */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Users className="h-5 w-5 text-primary" />
            <Link href={`/users/${user.username}/collections`} className="hover:text-primary transition-colors">
              Collections
            </Link>
          </h2>
          <Link href={`/users/${user.username}/collections`} className="text-sm text-primary hover:underline">
            View all collections →
          </Link>
        </section>
      </div>
    </>
  )
}
