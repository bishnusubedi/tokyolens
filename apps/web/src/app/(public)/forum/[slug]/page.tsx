'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Plus, MessageCircle, Clock } from 'lucide-react'
import { Button } from '@repo/ui'
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

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/forum" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Forum
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">{slug.replace(/_/g, ' ')}</h1>
          {user && (
            <Button size="sm" className="bg-gold text-zinc-950 hover:bg-gold-light" asChild>
              <Link href={`/forum/${slug}/new`}>
                <Plus className="h-4 w-4 mr-1" />
                New Thread
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No threads yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forum/threads/${thread.id}`}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-gold/30 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium group-hover:text-gold transition-colors truncate">{thread.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                    <span>by @{thread.author.username}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(thread.createdAt), 'MMM d')}
                    </span>
                    {thread._count && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {thread._count.replies}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
