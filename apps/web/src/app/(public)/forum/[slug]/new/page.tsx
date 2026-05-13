'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Send } from 'lucide-react'
import { useCreateThread } from '@/hooks/use-forum'
import { Header } from '@/components/layout/Header'

const CATEGORY_LABELS: Record<string, string> = {
  EQUIPMENT_REVIEWS: 'Equipment Reviews',
  TOKYO_PHOTO_SPOTS: 'Tokyo Photo Spots',
  CRITIQUE_MY_WORK: 'Critique My Work',
  GENERAL: 'General Discussion',
}

const TITLE_MAX = 150
const BODY_MAX = 10000

export default function NewThreadPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const create = useCreateThread()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const categoryLabel = CATEGORY_LABELS[slug] ?? slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const canSubmit = title.trim().length >= 5 && body.trim().length >= 10 && !create.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await create.mutateAsync({ title: title.trim(), body: body.trim(), categorySlug: slug })
    router.push(`/forum/${slug}`)
  }

  return (
    <>
      <Header />
      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <Link
          href={`/forum/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#767676] hover:text-[#111] transition-colors mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {categoryLabel}
        </Link>

        <h1 className="text-[24px] font-bold text-[#111] mb-1">New Thread</h1>
        <p className="text-sm text-[#767676] mb-8">
          Posting in <span className="font-semibold text-[#111]">{categoryLabel}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {create.error && (
            <div className="rounded-2xl bg-[#fff0f1] border border-[#f9c3c9] px-4 py-3 text-sm text-[#ad081b] font-medium">
              {create.error.message}
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="title" className="text-sm font-bold text-[#111]">Title</label>
              <span className={`text-xs ${title.length > TITLE_MAX * 0.9 ? 'text-[#e60023]' : 'text-[#cdcdd4]'}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="What's this thread about?"
              required
              minLength={5}
              className="w-full h-[52px] px-4 rounded-2xl border border-[#cdcdd4] bg-white text-[#111] text-sm placeholder:text-[#cdcdd4] outline-none focus:border-[#111] transition-colors"
            />
            {title.length > 0 && title.length < 5 && (
              <p className="text-xs text-[#ad081b] mt-1.5 ml-1">Title must be at least 5 characters</p>
            )}
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="body" className="text-sm font-bold text-[#111]">Body</label>
              <span className={`text-xs ${body.length > BODY_MAX * 0.9 ? 'text-[#e60023]' : 'text-[#cdcdd4]'}`}>
                {body.length}/{BODY_MAX}
              </span>
            </div>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
              placeholder="Share your thoughts, question, or photo spot details…"
              required
              minLength={10}
              rows={10}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#cdcdd4] bg-white text-[#111] text-sm placeholder:text-[#cdcdd4] outline-none focus:border-[#111] transition-colors resize-none leading-relaxed"
            />
            {body.length > 0 && body.length < 10 && (
              <p className="text-xs text-[#ad081b] mt-1.5 ml-1">Body must be at least 10 characters</p>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-2xl bg-[#f8f8f8] border border-[#efefef] px-4 py-4">
            <p className="text-xs font-bold text-[#767676] uppercase tracking-wider mb-2">Tips for a great post</p>
            <ul className="space-y-1 text-xs text-[#767676]">
              {slug === 'CRITIQUE_MY_WORK' && <li>• Include which aspects you want feedback on</li>}
              {slug === 'TOKYO_PHOTO_SPOTS' && <li>• Add the neighborhood and nearest station</li>}
              {slug === 'EQUIPMENT_REVIEWS' && <li>• Mention your shooting style and experience level</li>}
              <li>• Be specific and descriptive for better responses</li>
              <li>• Check existing threads to avoid duplicates</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/forum/${slug}`}
              className="h-10 px-5 rounded-full border border-[#cdcdd4] text-sm font-bold text-[#767676] hover:bg-[#f4f4f4] transition-colors inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {create.isPending ? 'Posting…' : 'Post thread'}
            </button>
          </div>
        </form>

      </div>
    </>
  )
}
