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

  return (
    <Link href={`/photos/${photo.id}`} className="group block masonry-item">
      <div className="relative overflow-hidden rounded-lg bg-muted">
        <Image
          src={src.startsWith('http') ? src : `${apiBase}${src}`}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Save button — top right on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SaveButton photoId={photo.id} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-medium line-clamp-1">{photo.title}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/70 text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {photo.neighborhood}
            </span>
            <span className={cn('text-xs flex items-center gap-1', photo.hasVoted ? 'text-primary' : 'text-white/70')}>
              <Heart className={cn('h-3 w-3', photo.hasVoted && 'fill-primary')} />
              {photo.voteCount}
            </span>
          </div>
          <p className="text-white/60 text-xs mt-1">@{photo.author.username}</p>
        </div>
      </div>
    </Link>
  )
}
