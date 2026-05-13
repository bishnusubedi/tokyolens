import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Heart, MapPin } from 'lucide-react'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

type AwardWithPhoto = {
  id: string
  type: string
  voteCount: number
  periodStart: string
  photo: {
    id: string
    title: string
    imageUrl: string
    thumbnailUrl: string | null
    neighborhood: string
    author: { username: string; name: string; avatarUrl: string | null }
  }
}

interface ChampionHeroProps {
  award: AwardWithPhoto | null
}

export function ChampionHero({ award }: ChampionHeroProps) {
  if (!award) {
    return (
      <section className="relative h-[50vh] min-h-[360px] flex items-center justify-center bg-[#f6f6f3]">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-[#e60023] mx-auto mb-4 opacity-40" />
          <h2 className="text-[22px] font-semibold text-black">No champion yet this week</h2>
          <p className="text-[#62625b] mt-2 text-sm">Upload a photo and get the community voting!</p>
          <Link
            href="/upload"
            className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] transition-colors"
          >
            Upload now
          </Link>
        </div>
      </section>
    )
  }

  const imgSrc = award.photo.imageUrl.startsWith('http')
    ? award.photo.imageUrl
    : `${API_URL}${award.photo.imageUrl}`

  const week = new Date(award.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
      <Image
        src={imgSrc}
        alt={award.photo.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-[#e60023] text-white px-3 py-1.5 rounded-full text-xs font-bold">
          <Trophy className="h-3.5 w-3.5" />
          Week of {week}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-[1280px] mx-auto w-full">
        <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">Weekly Champion</p>
        <h2 className="text-white text-3xl md:text-5xl font-bold mb-4 max-w-2xl leading-tight">
          {award.photo.title}
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {award.photo.neighborhood}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 fill-[#e60023] text-[#e60023]" />
            {award.voteCount} high-fives
          </span>
          <Link href={`/users/${award.photo.author.username}`} className="hover:text-white transition-colors">
            by @{award.photo.author.username}
          </Link>
        </div>
        <Link
          href={`/photos/${award.photo.id}`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] transition-colors"
        >
          View photo
        </Link>
      </div>
    </section>
  )
}
