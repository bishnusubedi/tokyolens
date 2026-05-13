'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MapPin, Camera, ChevronLeft, Send, Trash2, Calendar, MessageCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@repo/ui'
import { usePhoto, useComments, useVote, useAddComment, useDeletePhoto, useRelatedPhotos } from '@/hooks/use-photos'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { PhotoCard } from '@/components/photos/PhotoCard'
import { SaveButton } from '@/components/photos/SaveButton'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { format } from 'date-fns'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

function imgUrl(url: string) {
  return url.startsWith('http') ? url : `${API_URL}${url}`
}

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: photoData, isLoading } = usePhoto(id)
  const { data: commentsData } = useComments(id)
  const { data: relatedData } = useRelatedPhotos(id)
  const { data: meData } = useMe()
  const vote = useVote(id)
  const addComment = useAddComment(id)
  const deletePhoto = useDeletePhoto()
  const [comment, setComment] = useState('')

  const photo = photoData?.data
  const comments = commentsData?.data ?? []
  const related = relatedData?.data ?? []
  const user = meData?.data

  const { data: discussData } = useQuery({
    queryKey: queryKeys.photos.discuss(id),
    queryFn: () => apiClient.get<{ data: { id: string; title: string; replyCount: number } | null }>(`/api/photos/${id}/discuss`),
    enabled: !!photo,
  })

  const qc = useQueryClient()
  const createDiscuss = useMutation({
    mutationFn: () => apiClient.post<{ data: { id: string } }>(`/api/photos/${id}/discuss`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.photos.discuss(id) }) },
  })

  const forumThread = discussData?.data

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

  if (!photo) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Photo not found.
        </div>
      </>
    )
  }

  const handleVote = () => {
    if (!user) { router.push('/login'); return }
    vote.mutate()
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !user) return
    addComment.mutate(comment, { onSuccess: () => setComment('') })
  }

  const handleDelete = async () => {
    if (!confirm('Delete this photo?')) return
    await deletePhoto.mutateAsync(photo.id)
    router.push('/')
  }

  const canDelete = user && (user.id === photo.author.id || user.role === 'ADMIN' || user.role === 'MODERATOR')

  const exifFields = [
    { label: 'Camera', value: [photo.cameraMake, photo.cameraModel].filter(Boolean).join(' ') },
    { label: 'Lens', value: photo.lens },
    { label: 'ISO', value: photo.iso },
    { label: 'Aperture', value: photo.aperture },
    { label: 'Shutter', value: photo.shutterSpeed },
    { label: 'Focal length', value: photo.focalLength },
  ].filter((f) => f.value)

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#62625b] hover:text-black text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left: Photo */}
          <div>
            <div className="rounded-[16px] overflow-hidden bg-[#f6f6f3]">
              <Image
                src={imgUrl(photo.imageUrl)}
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto"
                priority
                sizes="(max-width: 1024px) 100vw, calc(100vw - 460px)"
              />
            </div>
            {/* Author below photo */}
            <div className="flex items-center gap-3 mt-4">
              <Link href={`/users/${photo.author.username}`} className="flex items-center gap-2 group">
                <div className="h-9 w-9 rounded-full bg-[#f6f6f3] flex items-center justify-center text-xs font-bold border border-[#dadad3] overflow-hidden flex-shrink-0">
                  {photo.author.avatarUrl
                    ? <Image src={imgUrl(photo.author.avatarUrl)} alt={photo.author.name} width={36} height={36} className="object-cover" />
                    : photo.author.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black group-hover:text-[#e60023] transition-colors">{photo.author.name}</p>
                  <p className="text-xs text-[#62625b]">@{photo.author.username}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-5">
            {/* Title + meta */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-[22px] font-semibold text-black leading-tight">{photo.title}</h1>
                {canDelete && (
                  <button onClick={handleDelete} className="p-2 rounded-full text-[#91918c] hover:text-[#9e0a0a] hover:bg-[#f6f6f3] transition-colors flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f6f6f3] text-xs font-bold text-black">
                  <MapPin className="h-3 w-3" />
                  {photo.neighborhood}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#62625b]">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(photo.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              {photo.description && (
                <p className="text-sm text-[#62625b] mt-3 leading-relaxed">{photo.description}</p>
              )}
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {photo.tags.map((tag: { name: string; slug: string }) => (
                    <Link key={tag.slug} href={`/search?q=${encodeURIComponent(tag.name)}`}
                      className="px-2.5 py-1 rounded-full bg-[#f6f6f3] text-xs font-semibold text-black hover:bg-[#e5e5e0] transition-colors">
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleVote}
                disabled={vote.isPending}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-[16px] text-sm font-bold transition-all',
                  photo.hasVoted
                    ? 'bg-[#e60023]/10 text-[#e60023] border border-[#e60023]/30'
                    : 'bg-[#f6f6f3] text-black hover:bg-[#e5e5e0]',
                )}
              >
                <Heart className={cn('h-4 w-4', photo.hasVoted && 'fill-[#e60023] text-[#e60023]')} />
                {photo.hasVoted ? 'High-fived!' : 'High-five'}
                <span className="text-xs font-normal">{photo.voteCount}</span>
              </button>
              {user && (
                <SaveButton
                  photoId={photo.id}
                  className="px-5 py-2.5 rounded-[16px] text-sm font-bold bg-[#f6f6f3] text-black hover:bg-[#e5e5e0] transition-all"
                />
              )}
              <Link
                href={forumThread ? `/forum/threads/${forumThread.id}` : '#'}
                onClick={!forumThread ? async (e) => { e.preventDefault(); if (user) await createDiscuss.mutateAsync() } : undefined}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[16px] text-sm font-bold bg-[#f6f6f3] text-black hover:bg-[#e5e5e0] transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                {forumThread ? `Discuss (${forumThread.replyCount})` : 'Discuss in Forum'}
              </Link>
            </div>

            {/* EXIF */}
            {exifFields.length > 0 && (
              <div className="rounded-[16px] border border-[#dadad3] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Camera className="h-4 w-4 text-[#e60023]" />
                  Camera Info
                </div>
                <dl className="grid grid-cols-2 gap-2">
                  {exifFields.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-xs text-[#62625b]">{label}</dt>
                      <dd className="text-xs font-semibold text-black mt-0.5">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Comments */}
            <div>
              <h3 className="text-sm font-semibold text-black mb-3">Comments ({comments.length})</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[#f6f6f3] border border-[#dadad3] flex items-center justify-center text-xs font-bold">
                      {c.author.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-black">@{c.author.username}</span>
                      <p className="text-sm text-[#62625b] mt-0.5">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user ? (
                <form onSubmit={handleComment} className="flex gap-2 mt-3">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 h-9 px-3 text-sm bg-white border border-[#dadad3] rounded-[16px] focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={addComment.isPending || !comment.trim()}
                    className="h-9 w-9 flex-shrink-0 rounded-full bg-[#e60023] text-white flex items-center justify-center hover:bg-[#cc001f] disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-[#62625b] mt-3">
                  <Link href="/login" className="text-[#e60023] hover:underline">Sign in</Link> to comment
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Photos */}
        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t border-[#dadad3]">
            <h2 className="text-[22px] font-semibold text-black mb-6">More like this</h2>
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2">
              {related.map((p, i) => (
                <div key={p.id} className="break-inside-avoid mb-2">
                  <PhotoCard photo={p} priority={i < 2} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
