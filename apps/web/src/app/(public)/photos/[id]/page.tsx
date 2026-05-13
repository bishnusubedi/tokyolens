'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MapPin, Camera, ChevronLeft, Send, Trash2, Calendar, Grid3X3 } from 'lucide-react'
import { Button, Input } from '@repo/ui'
import { cn } from '@repo/ui'
import { usePhoto, useComments, useVote, useAddComment, useDeletePhoto, useRelatedPhotos } from '@/hooks/use-photos'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { PhotoCard } from '@/components/photos/PhotoCard'
import { SaveButton } from '@/components/photos/SaveButton'
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
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <div>
              <div className="relative rounded-xl overflow-hidden bg-muted">
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
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{photo.title}</h1>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {photo.neighborhood}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(photo.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                {photo.description && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{photo.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/users/${photo.author.username}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-border overflow-hidden">
                    {photo.author.avatarUrl
                      ? <Image src={imgUrl(photo.author.avatarUrl)} alt={photo.author.name} width={32} height={32} className="object-cover" />
                      : photo.author.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{photo.author.name}</p>
                    <p className="text-xs text-muted-foreground">@{photo.author.username}</p>
                  </div>
                </Link>
                {canDelete && (
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVote}
                  disabled={vote.isPending}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    photo.hasVoted
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80',
                  )}
                >
                  <Heart className={cn('h-4 w-4', photo.hasVoted && 'fill-primary text-primary')} />
                  {photo.hasVoted ? 'High-fived!' : 'High-five'}
                  <span className="text-xs">{photo.voteCount}</span>
                </button>
                {user && (
                  <SaveButton
                    photoId={photo.id}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 transition-all"
                  />
                )}
              </div>

              {exifFields.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Camera className="h-4 w-4 text-primary" />
                    EXIF Data
                  </div>
                  <dl className="grid grid-cols-2 gap-2">
                    {exifFields.map(({ label, value }) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="text-xs font-medium mt-0.5">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-3">Comments ({comments.length})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="h-7 w-7 flex-shrink-0 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold">
                        {c.author.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-medium">@{c.author.username}</span>
                        <p className="text-sm text-muted-foreground mt-0.5">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {user ? (
                  <form onSubmit={handleComment} className="flex gap-2 mt-3">
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment…"
                      className="flex-1 h-8 text-sm"
                    />
                    <Button type="submit" size="icon" className="h-8 w-8 flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" disabled={addComment.isPending || !comment.trim()}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-muted-foreground mt-3">
                    <Link href="/login" className="text-primary hover:underline">Sign in</Link> to comment
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related Photos */}
          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-6">
                <Grid3X3 className="h-5 w-5 text-primary" />
                More like this
              </h2>
              <div className="masonry">
                {related.map((p, i) => (
                  <PhotoCard key={p.id} photo={p} priority={i < 2} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
