'use client'

import { useState } from 'react'
import { MasonryGrid } from './MasonryGrid'
import { CategoryFilter } from '../layout/CategoryFilter'
import type { PhotoCategory } from '@repo/shared'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'top' },
  { label: 'Trending', value: 'trending' },
] as const

type SortBy = 'newest' | 'top' | 'trending'

export function PhotoFeed() {
  const [category, setCategory] = useState<PhotoCategory | ''>('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-[64px] z-40 bg-white pt-3 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <CategoryFilter value={category} onChange={setCategory} />
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  sortBy === opt.value
                    ? 'bg-[#111] text-white'
                    : 'bg-[#efefef] text-[#111] hover:bg-[#ddd]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MasonryGrid
        key={`${category}-${sortBy}`}
        params={{ category: category || undefined, sortBy }}
      />
    </div>
  )
}
