'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Globe, Instagram, Trophy, Camera } from 'lucide-react'
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

type ProfileTab = 'photos' | 'awards'

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [activeTab, setActiveTab] = useState<ProfileTab>('photos')

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
          <div className="h-8 w-8 rounded-full border-2 border-[#e60023] border-t-transparent animate-spin" />
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-[#62625b]">User not found.</div>
      </>
    )
  }

  return (
    <>
      <Header />
      {/* Profile banner */}
      <div className="w-full bg-[#fbfbf9]">
        <div className="mx-auto max-w-[1280px] px-4 py-10">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-[#e5e5e0] overflow-hidden flex items-center justify-center text-2xl font-bold flex-shrink-0 text-[#62625b]">
              {user.avatarUrl
                ? <Image src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_URL}${user.avatarUrl}`} alt={user.name} width={80} height={80} className="object-cover w-full h-full" />
                : user.name[0]?.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#000000]">{user.name}</h1>
                {awards.length > 0 && (
                  <div className="flex items-center gap-1 bg-[#fff3f4] text-[#e60023] px-3 py-1 rounded-full text-xs font-medium">
                    <Trophy className="h-3 w-3" />
                    {awards.length} award{awards.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <p className="text-[#62625b] text-sm mt-0.5">@{user.username}</p>

              {/* Follow stats */}
              <div className="flex items-center gap-5 mt-3 text-sm">
                <Link href={`/users/${user.username}/followers`} className="flex items-center gap-1 hover:text-[#e60023] transition-colors">
                  <span className="font-bold text-[#000000]">{user.followerCount ?? 0}</span>
                  <span className="text-[#62625b]">followers</span>
                </Link>
                <Link href={`/users/${user.username}/following`} className="flex items-center gap-1 hover:text-[#e60023] transition-colors">
                  <span className="font-bold text-[#000000]">{user.followingCount ?? 0}</span>
                  <span className="text-[#62625b]">following</span>
                </Link>
              </div>

              {user.bio && <p className="text-sm mt-3 max-w-xl text-[#000000]">{user.bio}</p>}

              <div className="flex items-center gap-4 mt-3 text-sm text-[#62625b] flex-wrap">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.location}
                  </span>
                )}
                {user.websiteUrl && (
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#e60023] transition-colors">
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                {user.instagramUrl && (
                  <a href={`https://instagram.com/${user.instagramUrl.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#e60023] transition-colors">
                    <Instagram className="h-3.5 w-3.5" />
                    Instagram
                  </a>
                )}
              </div>

              <div className="mt-4">
                <FollowButton username={user.username} isFollowing={user.isFollowing} userId={user.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation + content */}
      <div className="mx-auto max-w-[1280px] px-4 mt-8">
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-[#000000] text-white'
                : 'bg-[#f6f6f3] text-[#62625b] hover:text-[#000000]'
            }`}
          >
            <Camera className="h-4 w-4" />
            Photos ({photos.length})
          </button>
          {awards.length > 0 && (
            <button
              onClick={() => setActiveTab('awards')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'awards'
                  ? 'bg-[#000000] text-white'
                  : 'bg-[#f6f6f3] text-[#62625b] hover:text-[#000000]'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Awards ({awards.length})
            </button>
          )}
        </div>

        {/* Photos tab */}
        {activeTab === 'photos' && (
          <section className="pb-16">
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <Camera className="h-12 w-12 text-[#dadad3]" />
                <p className="text-[#62625b] text-sm">No photos yet.</p>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="break-inside-avoid mb-2">
                    <PhotoCard photo={photo} priority={i < 4} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Awards tab */}
        {activeTab === 'awards' && (
          <section className="pb-16">
            {awards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <Trophy className="h-12 w-12 text-[#dadad3]" />
                <p className="text-[#62625b] text-sm">No awards yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {awards.map((award) => {
                  const src = award.photo.thumbnailUrl ?? award.photo.imageUrl
                  return (
                    <Link
                      key={award.id}
                      href={`/photos/${award.photo.id}`}
                      className="group bg-[#f6f6f3] rounded-[16px] overflow-hidden hover:ring-2 hover:ring-[#e60023] transition-all"
                    >
                      <div className="relative">
                        <Image
                          src={src.startsWith('http') ? src : `${API_URL}${src}`}
                          alt={award.photo.title}
                          width={300}
                          height={200}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#e60023] text-white text-xs font-semibold px-2 py-1 rounded-full">
                          <Trophy className="h-3 w-3" />
                          {award.type === 'WEEKLY_WINNER' ? 'Weekly' : 'Monthly'}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-[#000000] truncate">{award.photo.title}</p>
                        <p className="text-xs text-[#62625b] mt-0.5">{award.voteCount} votes</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}
