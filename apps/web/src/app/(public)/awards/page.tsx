'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Heart, MapPin } from 'lucide-react'
import { useAwards } from '@/hooks/use-awards'
import { Header } from '@/components/layout/Header'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

function imgUrl(url: string) {
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

function AwardTypeBadge({ type }: { type: string }) {
  const isMonthly = type === 'MONTHLY_WINNER'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        isMonthly
          ? 'bg-[#7e238b]/10 text-[#7e238b]'
          : 'bg-[#e60023]/10 text-[#e60023]'
      }`}
    >
      <Trophy className="h-3 w-3" />
      {isMonthly ? 'Monthly' : 'Weekly'} Winner
    </span>
  )
}

export default function AwardsPage() {
  const { data, isLoading } = useAwards(30)
  const awards = data?.data ?? []

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-[28px] font-bold text-black mb-2"
            style={{ fontFamily: "'Manrope', var(--font-inter), sans-serif" }}
          >
            Photo Awards
          </h1>
          <p className="text-[#62625b] text-sm">
            Celebrating the best photography from the Tokyo community — weekly and monthly champions.
          </p>
        </div>

        {isLoading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-2 rounded-[16px] bg-[#f6f6f3] aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : awards.length === 0 ? (
          <div className="text-center py-24 text-[#62625b]">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No awards yet</p>
            <p className="text-sm mt-1">Check back after voting closes!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2">
            {awards.map((award, i) => (
              <div key={award.id} className="break-inside-avoid mb-2">
                <Link href={`/photos/${award.photo.id}`} className="group block">
                  <div className="relative rounded-[16px] overflow-hidden bg-[#f6f6f3]">
                    <Image
                      src={imgUrl(award.photo.thumbnailUrl ?? award.photo.imageUrl)}
                      alt={award.photo.title}
                      width={400}
                      height={500}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      priority={i < 4}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    {/* Award badge — always visible top-left */}
                    <div className="absolute top-2 left-2">
                      <AwardTypeBadge type={award.type} />
                    </div>
                    {/* Meta overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-semibold line-clamp-1">{award.photo.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {award.photo.neighborhood}
                        </span>
                        <span className="text-white/70 text-xs flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {award.voteCount}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs mt-1">@{award.photo.author.username}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
