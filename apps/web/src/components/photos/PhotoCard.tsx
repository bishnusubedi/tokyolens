'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
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

  const initials = photo.author.name[0]?.toUpperCase() ?? '?'

  return (
    <div className="group">
      {/* Image card */}
      <Link href={`/photos/${photo.id}`} className="block relative overflow-hidden rounded-[16px] bg-[#efefef]">
        <Image
          src={imgSrc}
          alt={photo.title}
          width={photo.width || 600}
          height={photo.height || 400}
          className="w-full h-auto object-cover block"
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Dark gradient on hover — bottom only */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[16px]" />

        {/* Save button — top right on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
          <SaveButton photoId={photo.id} />
        </div>

        {/* Neighborhood tag — bottom left on hover */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <span className="inline-block bg-white text-[#111] text-[11px] font-bold px-2.5 py-1 rounded-full leading-none">
            {photo.neighborhood}
          </span>
        </div>
      </Link>

      {/* Below-image metadata — always visible */}
      <div className="px-1 pt-2 pb-3">
        <p className="text-[13px] font-bold text-[#111] leading-snug line-clamp-2 mb-1.5">
          {photo.title}
        </p>
        <div className="flex items-center justify-between">
          <Link href={`/users/${photo.author.username}`}
            className="flex items-center gap-1.5 min-w-0"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-6 h-6 rounded-full bg-[#e60023] flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
              {photo.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.author.avatarUrl.startsWith('http') ? photo.author.avatarUrl : `${apiBase}${photo.author.avatarUrl}`}
                  alt={photo.author.name} className="w-full h-full object-cover" />
              ) : initials}
            </div>
            <span className="text-[12px] text-[#767676] font-semibold truncate hover:text-[#111] transition-colors">
              {photo.author.name}
            </span>
          </Link>
          <span className={cn('flex items-center gap-0.5 text-[12px] font-semibold flex-shrink-0',
            photo.hasVoted ? 'text-[#e60023]' : 'text-[#767676]')}>
            <Heart className={cn('h-3 w-3', photo.hasVoted && 'fill-[#e60023]')} />
            {photo.voteCount}
          </span>
        </div>
      </div>
    </div>
  )
}
