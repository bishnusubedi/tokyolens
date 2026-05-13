'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { cn } from '@repo/ui'
import { SaveButton } from './SaveButton'

type Photo = {
  id: string
  title: string
  imageUrl: string
  thumbnailUrl: string | null
  width: number
  height: number
  neighborhood: string
  voteCount: number
  hasVoted?: boolean
  author: { username: string; name: string; avatarUrl: string | null }
}

interface PhotoCardProps {
  photo: Photo
  priority?: boolean
}

export function PhotoCard({ photo, priority }: PhotoCardProps) {
  const src = photo.thumbnailUrl ?? photo.imageUrl
  const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

  const imgSrc = src.startsWith('http') ? src : `${apiBase}${src}`

  return (
    <Link href={`/photos/${photo.id}`} className="group block">
      <div className="relative overflow-hidden rounded-[16px] bg-[#f6f6f3]">
        {/* Full-bleed pin image — no internal padding */}
        <Image
          src={imgSrc}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {/* Save button top right on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SaveButton photoId={photo.id} />
        </div>
        {/* Neighborhood overlay pill top left on hover */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="flex items-center gap-1 bg-white text-black text-xs font-bold px-2.5 py-1 rounded-full">
            <MapPin className="h-3 w-3" />
            {photo.neighborhood}
          </span>
        </div>
        {/* Bottom meta on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-semibold line-clamp-1">{photo.title}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-white/70 text-xs">@{photo.author.username}</span>
            <span className={cn('text-xs flex items-center gap-1', photo.hasVoted ? 'text-[#e60023]' : 'text-white/70')}>
              <Heart className={cn('h-3 w-3', photo.hasVoted && 'fill-[#e60023]')} />
              {photo.voteCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
