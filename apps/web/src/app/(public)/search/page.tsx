'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PhotoCard } from '@/components/photos/PhotoCard'
import { useSearchPhotos, useSearchUsers, useSearchBoards } from '@/hooks/use-search'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

type Tab = 'photos' | 'people' | 'boards'

export default function SearchPage() {
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const [tab, setTab] = useState<Tab>('photos')

  const photos = useSearchPhotos(q)
  const users = useSearchUsers(q, tab === 'people')
  const boards = useSearchBoards(q, tab === 'boards')

  if (!q) return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 py-24 text-center">
        <Search className="h-12 w-12 text-[#91918c] mx-auto mb-4" />
        <p className="text-[#62625b]">Search for photos, photographers, and boards</p>
      </div>
    </>
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'photos', label: 'Photos' },
    { id: 'people', label: 'People' },
    { id: 'boards', label: 'Boards' },
  ]

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold text-black">Results for &quot;{q}&quot;</h1>
          <p className="text-sm text-[#62625b] mt-1">{photos.data?.meta.total ?? 0} photos found</p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                tab === t.id ? 'bg-black text-white' : 'bg-[#f6f6f3] text-black hover:bg-[#e5e5e0]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Photos tab */}
        {tab === 'photos' && (
          photos.isLoading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-2 rounded-[16px] bg-[#f6f6f3] aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (photos.data?.data.length ?? 0) === 0 ? (
            <div className="text-center py-16 text-[#62625b]">
              <p>No photos found for &quot;{q}&quot;</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
              {photos.data!.data.map((photo, i) => (
                <div key={photo.id} className="break-inside-avoid mb-2">
                  <PhotoCard photo={photo} priority={i < 6} />
                </div>
              ))}
            </div>
          )
        )}

        {/* People tab */}
        {tab === 'people' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.data?.data.map((user) => (
              <Link key={user.id} href={`/users/${user.username}`} className="bg-[#f6f6f3] rounded-[16px] p-4 hover:ring-2 hover:ring-[#e60023] transition-all text-center">
                <div className="h-16 w-16 rounded-full bg-[#e5e5e0] mx-auto mb-3 overflow-hidden flex items-center justify-center text-xl font-bold text-black">
                  {user.avatarUrl
                    ? <Image src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_URL}${user.avatarUrl}`} alt={user.name} width={64} height={64} className="object-cover" />
                    : user.name[0]?.toUpperCase()}
                </div>
                <p className="font-semibold text-sm text-black">{user.name}</p>
                <p className="text-xs text-[#62625b]">@{user.username}</p>
                <p className="text-xs text-[#62625b] mt-1">{user._count.photos} photos · {user._count.followers} followers</p>
              </Link>
            ))}
          </div>
        )}

        {/* Boards tab */}
        {tab === 'boards' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.data?.data.map((board) => (
              <Link key={board.id} href={`/users/${board.user.username}`} className="bg-[#f6f6f3] rounded-[16px] p-4 hover:ring-2 hover:ring-[#e60023] transition-all">
                <div className="h-24 rounded-[12px] bg-[#e5e5e0] mb-3 flex items-center justify-center text-[#91918c] text-3xl font-bold">
                  B
                </div>
                <p className="font-semibold text-sm text-black line-clamp-1">{board.name}</p>
                <p className="text-xs text-[#62625b]">by @{board.user.username}</p>
                <p className="text-xs text-[#62625b] mt-1">{board._count.items} pins</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
