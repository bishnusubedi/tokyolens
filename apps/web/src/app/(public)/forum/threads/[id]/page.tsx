'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Send, Lock } from 'lucide-react'
import { Button, Input } from '@repo/ui'
import { useForumThread, useForumReplies, useCreateReply } from '@/hooks/use-forum'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { format } from 'date-fns'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>()
  const { data: threadData, isLoading: threadLoading } = useForumThread(id)
  const { data: repliesData } = useForumReplies(id)
  const { data: meData } = useMe()
  const createReply = useCreateReply(id)
  const [body, setBody] = useState('')

  const thread = threadData?.data
  const replies = repliesData?.data?.data ?? []
  const user = meData?.data

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    createReply.mutate({ body }, { onSuccess: () => setBody('') })
  }

  if (threadLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </>
    )
  }

  if (!thread) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">Thread not found.</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/forum" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Forum
        </Link>

        <div className="border border-border rounded-xl bg-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold leading-tight">{thread.title}</h1>
            {thread.locked && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0">
                <Lock className="h-3 w-3" />
                Locked
              </div>
            )}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{thread.body}</p>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <Link href={`/users/${thread.author.username}`} className="hover:text-primary transition-colors">
              @{thread.author.username}
            </Link>
            <span>·</span>
            <span>{format(new Date(thread.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {replies.map((reply, i) => (
            <div key={reply.id} className="flex gap-3">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold overflow-hidden">
                {reply.author.avatarUrl
                  ? <Image src={reply.author.avatarUrl.startsWith('http') ? reply.author.avatarUrl : `${API_URL}${reply.author.avatarUrl}`} alt={reply.author.name} width={32} height={32} className="object-cover" />
                  : reply.author.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/users/${reply.author.username}`} className="text-sm font-medium hover:text-primary transition-colors">
                    @{reply.author.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">{format(new Date(reply.createdAt), 'MMM d')}</span>
                  <span className="text-xs text-muted-foreground ml-auto">#{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                {reply.embeddedPhoto && (
                  <Link href={`/photos/${reply.embeddedPhoto.id}`} className="mt-3 block">
                    <Image
                      src={(reply.embeddedPhoto.thumbnailUrl ?? reply.embeddedPhoto.imageUrl).startsWith('http')
                        ? (reply.embeddedPhoto.thumbnailUrl ?? reply.embeddedPhoto.imageUrl)
                        : `${API_URL}${reply.embeddedPhoto.thumbnailUrl ?? reply.embeddedPhoto.imageUrl}`}
                      alt={reply.embeddedPhoto.title}
                      width={300}
                      height={200}
                      className="rounded-md object-cover max-h-48"
                    />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {!thread.locked && user ? (
          <form onSubmit={handleReply} className="border border-border rounded-xl bg-card p-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a reply…"
              rows={4}
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
            />
            <div className="flex justify-end mt-3">
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createReply.isPending || !body.trim()}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Reply
              </Button>
            </div>
          </form>
        ) : !user ? (
          <p className="text-sm text-center text-muted-foreground py-4">
            <Link href="/login" className="text-primary hover:underline">Sign in</Link> to reply
          </p>
        ) : null}
      </div>
    </>
  )
}
