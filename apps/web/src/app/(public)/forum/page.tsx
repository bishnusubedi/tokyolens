'use client'

import Link from 'next/link'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { useForumCategories } from '@/hooks/use-forum'
import { Header } from '@/components/layout/Header'

const SLUG_LABELS: Record<string, string> = {
  EQUIPMENT_REVIEWS: '📷 Equipment Reviews',
  TOKYO_PHOTO_SPOTS: '🗺️ Tokyo Photo Spots',
  CRITIQUE_MY_WORK: '🎨 Critique My Work',
  GENERAL: '💬 General Discussion',
}

export default function ForumPage() {
  const { data, isLoading } = useForumCategories()
  const categories = data?.data ?? []

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-gold" />
            Forum
          </h1>
          <p className="text-muted-foreground mt-2">Discuss photography with the Tokyo community.</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/forum/${cat.slug}`}
                className="flex items-center justify-between p-5 rounded-xl border border-border bg-card hover:border-gold/30 hover:bg-card/80 transition-all group"
              >
                <div>
                  <h2 className="font-semibold text-base group-hover:text-gold transition-colors">
                    {SLUG_LABELS[cat.slug] ?? cat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
