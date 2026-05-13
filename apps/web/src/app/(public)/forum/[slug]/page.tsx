'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Plus, MessageCircle, Pin } from 'lucide-react'
import { useForumThreads } from '@/hooks/use-forum'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_META: Record<string, { label: string; description: string; color: string }> = {
  EQUIPMENT_REVIEWS: {
    label: 'Equipment Reviews',
    description: 'Cameras, lenses, filters, bags — share your honest take.',
    color: '#1a73e8',
  },
  TOKYO_PHOTO_SPOTS: {
    label: 'Tokyo Photo Spots',
    description: 'Hidden alleys, rooftop views, golden-hour shrines — drop a pin.',
    color: '#188038',
  },
  CRITIQUE_MY_WORK: {
    label: 'Critique My Work',
    description: 'Post your shots and get honest, constructive feedback.',
    color: '#9334e6',
  },
  GENERAL: {
    label: 'General Discussion',
    description: 'Everything photography — tips, questions, inspiration.',
    color: '#e37400',
  },
}

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

export default function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading } = useForumThreads(slug)
  const { data: meData } = useMe()
  const user = meData?.data

  const threads = data?.data?.data ?? []
  const meta = CATEGORY_META[slug] ?? {
    label: slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: '',
    color: '#e60023',
  }

  return (
    <>
      <Header />

      {/* Category header */}
      <div className="bg-white border-b border-[#efefef]">
        <div className="max-w-[900px] mx-auto px-6 py-8">
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 text-sm text-[#767676] hover:text-[#111] transition-colors mb-5"
          >
            <ChevronLeft className="h-4 w-4" />
            Community Forum
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-bold text-[#111] leading-tight">{meta.label}</h1>
              <p className="text-sm text-[#767676] mt-1 max-w-lg">{meta.description}</p>
            </div>
            {user && (
              <Link
                href={`/forum/${slug}/new`}
                className="flex-shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-bold transition-colors"
                style={{ backgroundColor: meta.color, color: '#fff' }}
              >
                <Plus className="h-4 w-4" />
                New thread
              </Link>
            )}
          </div>

          {!user && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#767676]">
              <Link href="/login" className="font-bold text-[#e60023] hover:underline">Log in</Link>
              {' '}to start a thread
            </div>
          )}
        </div>
      </div>

      {/* Thread list */}
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[88px] rounded-2xl bg-[#f4f4f4] animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f4f4f4] flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-[#cdcdd4]" />
            </div>
            <div>
              <p className="font-bold text-[#111] text-lg">No threads yet</p>
              <p className="text-sm text-[#767676] mt-1">Be the first to start a conversation.</p>
            </div>
            {user && (
              <Link
                href={`/forum/${slug}/new`}
                className="mt-2 inline-flex items-center gap-2 h-10 px-6 rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Start a thread
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#f4f4f4]">
            {threads.map((thread) => {
              const avatarSrc = thread.author.avatarUrl
                ? (thread.author.avatarUrl.startsWith('http') ? thread.author.avatarUrl : `${API_URL}${thread.author.avatarUrl}`)
                : null

              return (
                <Link
                  key={thread.id}
                  href={`/forum/threads/${thread.id}`}
                  className="flex items-start gap-4 py-5 group"
                >
                  {/* Author avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#e60023] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden mt-0.5">
                    {avatarSrc
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={avatarSrc} alt={thread.author.name} className="w-full h-full object-cover" />
                      : thread.author.name[0]?.toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      {thread.pinned && (
                        <Pin className="h-3.5 w-3.5 text-[#e60023] flex-shrink-0 mt-0.5" />
                      )}
                      <h3 className="font-bold text-[#111] text-[15px] leading-snug group-hover:text-[#e60023] transition-colors line-clamp-2">
                        {thread.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#767676] mt-1 line-clamp-2 leading-relaxed">
                      {thread.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#999]">
                      <span className="font-semibold text-[#767676]">{thread.author.name}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                      {thread._count && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {thread._count.replies}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reply count badge */}
                  {thread._count && thread._count.replies > 0 && (
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-[#f4f4f4] text-center">
                      <span className="text-sm font-bold text-[#111] leading-none">{thread._count.replies}</span>
                      <span className="text-[9px] text-[#999] leading-none mt-0.5">replies</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
