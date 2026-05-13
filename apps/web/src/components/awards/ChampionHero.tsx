import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Heart, MapPin } from 'lucide-react'
import { Button } from '@repo/ui'

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
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-gradient-to-b from-zinc-900 to-background">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-gold mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-muted-foreground">No champion yet this week</h2>
          <p className="text-muted-foreground mt-2">Upload a photo and get the community voting!</p>
          <Button className="mt-6 bg-gold text-zinc-950 hover:bg-gold-light" asChild>
            <Link href="/upload">Upload now</Link>
          </Button>
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-gold/90 text-zinc-950 px-3 py-1.5 rounded-full text-sm font-semibold">
          <Trophy className="h-4 w-4" />
          Week of {week}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-2">Weekly Champion</p>
        <h1 className="text-white text-3xl md:text-5xl font-bold mb-3 max-w-2xl leading-tight">
          {award.photo.title}
        </h1>
        <div className="flex items-center gap-4 text-white/70">
          <span className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4" />
            {award.photo.neighborhood}
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <Heart className="h-4 w-4 fill-gold text-gold" />
            {award.voteCount} high-fives
          </span>
          <Link href={`/users/${award.photo.author.username}`} className="text-sm hover:text-white transition-colors">
            by @{award.photo.author.username}
          </Link>
        </div>
        <Button className="mt-5 bg-gold text-zinc-950 hover:bg-gold-light" asChild>
          <Link href={`/photos/${award.photo.id}`}>View photo →</Link>
        </Button>
      </div>
    </section>
  )
}
