'use client'

import { useState } from 'react'
import { MasonryGrid } from './MasonryGrid'
import { CategoryFilter } from '../layout/CategoryFilter'
import type { PhotoCategory } from '@repo/shared'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Top', value: 'top' },
  { label: 'Trending', value: 'trending' },
] as const

type SortBy = 'newest' | 'top' | 'trending'

export function PhotoFeed() {
  const [category, setCategory] = useState<PhotoCategory | ''>('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                sortBy === opt.value
                  ? 'bg-black text-white'
                  : 'bg-[#f6f6f3] text-black hover:bg-[#e5e5e0]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <MasonryGrid
        key={`${category}-${sortBy}`}
        params={{ category: category || undefined, sortBy }}
      />
    </div>
  )
}
