'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Send, Lock, MessageCircle, Camera } from 'lucide-react'
import { useForumThread, useForumReplies, useCreateReply } from '@/hooks/use-forum'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { format, formatDistanceToNow } from 'date-fns'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

function Avatar({ name, avatarUrl, size = 'md' }: { name: string; avatarUrl: string | null; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
  const src = avatarUrl
    ? (avatarUrl.startsWith('http') ? avatarUrl : `${API_URL}${avatarUrl}`)
    : null
  return (
    <div className={`${dim} rounded-full bg-[#e60023] flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden`}>
      {src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : name[0]?.toUpperCase()}
    </div>
  )
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>()
  const { data: threadData, isLoading } = useForumThread(id)
  const { data: repliesData } = useForumReplies(id)
  const { data: meData } = useMe()
  const createReply = useCreateReply(id)
  const [body, setBody] = useState('')

  const thread = threadData?.data
  const replies = repliesData?.data?.data ?? []
  const user = meData?.data
  const MAX = 2000

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    createReply.mutate({ body }, { onSuccess: () => setBody('') })
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-[760px] mx-auto px-6 py-12 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#f4f4f4] animate-pulse" />
          ))}
        </div>
      </>
    )
  }

  if (!thread) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <MessageCircle className="h-10 w-10 text-[#cdcdd4]" />
          <p className="font-bold text-[#111]">Thread not found</p>
          <Link href="/forum" className="text-sm text-[#e60023] hover:underline">Back to forum</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 text-sm text-[#767676] hover:text-[#111] transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Community Forum
        </Link>

        {/* Thread OP */}
        <div className="bg-white border border-[#efefef] rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              {thread.category && (
                <span className="text-xs font-bold text-[#767676] bg-[#f4f4f4] px-2.5 py-1 rounded-full">
                  {thread.category.name}
                </span>
              )}
              {thread.pinned && (
                <span className="text-xs font-bold text-[#e60023] bg-[#fff0f1] px-2.5 py-1 rounded-full">
                  Pinned
                </span>
              )}
            </div>
            {thread.locked && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#767676] bg-[#f4f4f4] px-2.5 py-1 rounded-full flex-shrink-0">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            )}
          </div>

          <h1 className="text-[22px] font-bold text-[#111] leading-snug mb-4">{thread.title}</h1>
          <p className="text-[15px] text-[#333] leading-relaxed whitespace-pre-wrap">{thread.body}</p>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#f4f4f4]">
            <Avatar name={thread.author.name} avatarUrl={thread.author.avatarUrl} />
            <div className="min-w-0">
              <Link href={`/users/${thread.author.username}`} className="text-sm font-bold text-[#111] hover:text-[#e60023] transition-colors">
                {thread.author.name}
              </Link>
              <p className="text-xs text-[#999]">
                {format(new Date(thread.createdAt), 'MMMM d, yyyy')}
                {' · '}
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </p>
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-3 mb-4">
            {replies.map((reply, i) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar name={reply.author.name} avatarUrl={reply.author.avatarUrl} />
                <div className="flex-1 min-w-0 bg-white border border-[#efefef] rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <Link
                      href={`/users/${reply.author.username}`}
                      className="text-sm font-bold text-[#111] hover:text-[#e60023] transition-colors"
                    >
                      {reply.author.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#999] flex-shrink-0">
                      <span>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                      <span className="text-[#ddd]">#{i + 1}</span>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                  {reply.embeddedPhoto && (
                    <Link href={`/photos/${reply.embeddedPhoto.id}`} className="mt-3 block group">
                      <div className="relative overflow-hidden rounded-xl inline-flex items-end gap-2 bg-[#f4f4f4] p-1">
                        <Image
                          src={(reply.embeddedPhoto.thumbnailUrl ?? reply.embeddedPhoto.imageUrl).startsWith('http')
                            ? (reply.embeddedPhoto.thumbnailUrl ?? reply.embeddedPhoto.imageUrl)
                            : `${API_URL}${reply.embeddedPhoto.thumbnailUrl ?? reply.embeddedPhoto.imageUrl}`}
                          alt={reply.embeddedPhoto.title}
                          width={240}
                          height={160}
                          className="rounded-lg object-cover h-36 w-auto group-hover:opacity-90 transition-opacity"
                        />
                        <div className="pb-1 pr-1">
                          <p className="text-xs font-bold text-[#111] leading-snug max-w-[120px] line-clamp-2">
                            {reply.embeddedPhoto.title}
                          </p>
                          <p className="text-[10px] text-[#767676] mt-0.5 flex items-center gap-0.5">
                            <Camera className="h-2.5 w-2.5" /> View photo
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply composer */}
        {thread.locked ? (
          <div className="flex items-center gap-2 py-4 px-5 rounded-2xl bg-[#f4f4f4] text-sm text-[#767676]">
            <Lock className="h-4 w-4 flex-shrink-0" />
            This thread is locked. No new replies can be posted.
          </div>
        ) : user ? (
          <div className="bg-white border border-[#efefef] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Avatar name={user.name} avatarUrl={user.avatarUrl ?? null} />
              <form onSubmit={handleReply} className="flex-1 min-w-0">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX))}
                  placeholder="Write a reply…"
                  rows={4}
                  className="w-full text-[14px] text-[#111] placeholder:text-[#cdcdd4] bg-[#f8f8f8] rounded-xl px-4 py-3 resize-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e60023]/20 border border-transparent focus:border-[#e60023]/30 transition-all"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#cdcdd4]">{body.length}/{MAX}</span>
                  <button
                    type="submit"
                    disabled={createReply.isPending || !body.trim()}
                    className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {createReply.isPending ? 'Posting…' : 'Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border border-[#efefef] rounded-2xl">
            <p className="text-sm text-[#767676] mb-3">Join the conversation</p>
            <div className="flex items-center justify-center gap-2">
              <Link href="/login" className="h-9 px-5 rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] transition-colors inline-flex items-center">
                Log in
              </Link>
              <Link href="/register" className="h-9 px-5 rounded-full border border-[#cdcdd4] text-sm font-bold text-[#111] hover:bg-[#f4f4f4] transition-colors inline-flex items-center">
                Sign up
              </Link>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
