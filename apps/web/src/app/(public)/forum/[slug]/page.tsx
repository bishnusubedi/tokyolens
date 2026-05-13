'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Plus, MessageCircle, Clock, User } from 'lucide-react'
import { useForumThreads } from '@/hooks/use-forum'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { format } from 'date-fns'

export default function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading } = useForumThreads(slug)
  const { data: meData } = useMe()
  const user = meData?.data

  const threads = data?.data?.data ?? []

  const categoryTitle = slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <Header />
      <div className="mx-auto px-4 py-8 max-w-[1280px]">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1.5 text-[#62625b] hover:text-[#000000] text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Forum
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-bold text-[#000000]">{categoryTitle}</h1>
          {user && (
            <Link
              href={`/forum/${slug}/new`}
              className="flex items-center gap-2 h-10 px-5 bg-[#e60023] text-white rounded-[16px] text-sm font-medium hover:bg-[#cc001f] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Thread
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3 max-w-3xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[72px] bg-[#f6f6f3] rounded-[16px] animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <MessageCircle className="h-10 w-10 text-[#dadad3]" />
            <p className="text-[#62625b]">No threads yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forum/threads/${thread.id}`}
                className="block bg-white border border-[#dadad3] rounded-[16px] p-4 hover:border-[#e60023] transition-all group"
              >
                <h3 className="text-base font-semibold text-[#000000] group-hover:text-[#e60023] transition-colors">
                  {thread.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[#62625b] mt-2">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    @{thread.author.username}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(thread.createdAt), 'MMM d')}
                  </span>
                  {thread._count && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {thread._count.replies} {thread._count.replies === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
