'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useForumCategories } from '@/hooks/use-forum'
import { Header } from '@/components/layout/Header'

const SLUG_LABELS: Record<string, string> = {
  EQUIPMENT_REVIEWS: 'Equipment Reviews',
  TOKYO_PHOTO_SPOTS: 'Tokyo Photo Spots',
  CRITIQUE_MY_WORK: 'Critique My Work',
  GENERAL: 'General Discussion',
}

export default function ForumPage() {
  const { data, isLoading } = useForumCategories()
  const categories = data?.data ?? []

  return (
    <>
      <Header />
      <div className="mx-auto px-4 py-10 max-w-[1280px]">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#000000]">Community Forum</h1>
          <p className="text-[#62625b] mt-2">Discuss photography with the Tokyo community</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#f6f6f3] rounded-[16px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/forum/${cat.slug}`}
                className="flex items-center justify-between bg-[#f6f6f3] rounded-[16px] p-5 hover:ring-2 hover:ring-[#e60023] transition-all group"
              >
                <div>
                  <h2 className="font-semibold text-base text-[#000000] group-hover:text-[#e60023] transition-colors">
                    {SLUG_LABELS[cat.slug] ?? cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-sm text-[#62625b] mt-1">{cat.description}</p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-[#62625b] group-hover:text-[#e60023] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
