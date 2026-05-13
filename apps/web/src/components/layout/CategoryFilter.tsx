'use client'

import { cn } from '@repo/ui'
import type { PhotoCategory } from '@repo/shared'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Street', value: 'STREET' },
  { label: 'Portrait', value: 'PORTRAIT' },
  { label: 'Landscape', value: 'LANDSCAPE' },
  { label: 'Architecture', value: 'ARCHITECTURE' },
  { label: 'Night', value: 'NIGHT' },
  { label: 'Macro', value: 'MACRO' },
  { label: 'Wildlife', value: 'WILDLIFE' },
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Abstract', value: 'ABSTRACT' },
  { label: 'Other', value: 'OTHER' },
]

interface CategoryFilterProps {
  value: PhotoCategory | ''
  onChange: (category: PhotoCategory | '') => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value as PhotoCategory | '')}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all',
            value === cat.value
              ? 'bg-black text-white'
              : 'bg-[#f6f6f3] text-black hover:bg-[#e5e5e0]',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
