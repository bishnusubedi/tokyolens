'use client'

import Link from 'next/link'
import { Camera, MapPin, Eye, MessageCircle, Wrench, ArrowRight, Plus, Clock, User } from 'lucide-react'
import { useForumCategories, useForumThreads } from '@/hooks/use-forum'
import { useMe } from '@/hooks/use-auth'
import { Header } from '@/components/layout/Header'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_META: Record<string, {
  icon: React.ReactNode
  color: string
  bg: string
  label: string
}> = {
  EQUIPMENT_REVIEWS: {
    icon: <Wrench className="h-5 w-5" />,
    color: 'text-[#1a73e8]',
    bg: 'bg-[#e8f0fe]',
    label: 'Equipment Reviews',
  },
  TOKYO_PHOTO_SPOTS: {
    icon: <MapPin className="h-5 w-5" />,
    color: 'text-[#188038]',
    bg: 'bg-[#e6f4ea]',
    label: 'Tokyo Photo Spots',
  },
  CRITIQUE_MY_WORK: {
    icon: <Eye className="h-5 w-5" />,
    color: 'text-[#9334e6]',
    bg: 'bg-[#f3e8fd]',
    label: 'Critique My Work',
  },
  GENERAL: {
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'text-[#e37400]',
    bg: 'bg-[#fef3e2]',
    label: 'General Discussion',
  },
}

function RecentThreads() {
  const { data: genData } = useForumThreads('GENERAL', 1)
  const { data: critiqueData } = useForumThreads('CRITIQUE_MY_WORK', 1)

  const genThreads = genData?.data?.data ?? []
  const critiqueThreads = critiqueData?.data?.data ?? []

  const recent = [...genThreads, ...critiqueThreads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  if (recent.length === 0) {
    return (
      <div className="text-sm text-[#767676] text-center py-8">
        No discussions yet.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {recent.map((thread) => (
        <Link
          key={thread.id}
          href={`/forum/threads/${thread.id}`}
          className="block p-3 rounded-xl hover:bg-[#f8f8f8] transition-colors group"
        >
          <p className="text-sm font-semibold text-[#111] line-clamp-2 group-hover:text-[#e60023] transition-colors leading-snug">
            {thread.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#767676]">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{thread.author.name}</span>
            <span className="flex-shrink-0">·</span>
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="flex-shrink-0">
              {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function ForumPage() {
  const { data, isLoading } = useForumCategories()
  const { data: meData } = useMe()
  const user = meData?.data
  const categories = data?.data ?? []

  return (
    <>
      <Header />

      {/* Hero */}
      <div className="bg-[#111] text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#e60023] flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/60 uppercase tracking-widest">Community</span>
              </div>
              <h1 className="text-[36px] font-bold leading-tight mb-2">Talk Photography</h1>
              <p className="text-[15px] text-white/60 max-w-md">
                Share knowledge, get feedback, and find hidden gems across Tokyo with fellow photographers.
              </p>
            </div>
            {user && (
              <Link
                href="/forum/GENERAL/new"
                className="flex-shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Start a discussion
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
            {[
              { label: 'Categories', value: '4' },
              { label: 'Topics', value: categories.reduce((n, c) => n + (c._count?.threads ?? 0), 0).toString() || '—' },
              { label: 'Community', value: 'Open' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/50 mt-0.5 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* Categories */}
          <div>
            <h2 className="text-[18px] font-bold text-[#111] mb-5">Browse Categories</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-[#f4f4f4] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const meta = CATEGORY_META[cat.slug] ?? {
                    icon: <MessageCircle className="h-5 w-5" />,
                    color: 'text-[#767676]',
                    bg: 'bg-[#f4f4f4]',
                    label: cat.name,
                  }
                  return (
                    <Link
                      key={cat.id}
                      href={`/forum/${cat.slug}`}
                      className="group flex flex-col gap-4 p-6 bg-white border border-[#efefef] rounded-2xl hover:border-[#e60023] hover:shadow-[0_0_0_1px_#e60023] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center`}>
                          {meta.icon}
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#cdcdd4] group-hover:text-[#e60023] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#111] text-[15px] mb-1">{meta.label}</h3>
                        <p className="text-sm text-[#767676] line-clamp-2 leading-relaxed">{cat.description}</p>
                      </div>
                      {cat._count && (
                        <p className="text-xs font-semibold text-[#767676] mt-auto">
                          {cat._count.threads} {cat._count.threads === 1 ? 'thread' : 'threads'}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Quick links */}
            <div className="mt-8 p-5 rounded-2xl bg-[#f8f8f8] border border-[#efefef]">
              <h3 className="text-sm font-bold text-[#111] mb-3">Community Guidelines</h3>
              <ul className="space-y-1.5 text-sm text-[#767676]">
                <li>Be respectful and constructive in critiques</li>
                <li>Include camera settings when posting gear questions</li>
                <li>Tag photo spots with the neighborhood name</li>
                <li>No spam or self-promotion without context</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Recent discussions */}
            <div className="bg-white border border-[#efefef] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-[#111]">Recent Discussions</h3>
                <Link href="/forum/GENERAL" className="text-xs font-semibold text-[#e60023] hover:underline">
                  See all
                </Link>
              </div>
              <RecentThreads />
            </div>

            {/* Join CTA for non-logged users */}
            {!user && (
              <div className="rounded-2xl bg-[#e60023] text-white p-5">
                <h3 className="font-bold text-[17px] mb-1">Join the community</h3>
                <p className="text-sm text-white/80 mb-4">
                  Create a free account to start discussions and share your shots.
                </p>
                <Link
                  href="/register"
                  className="block text-center py-2.5 rounded-full bg-white text-[#e60023] text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  Sign up free
                </Link>
                <Link
                  href="/login"
                  className="block text-center mt-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Already a member? Log in
                </Link>
              </div>
            )}

            {/* Photo spots teaser */}
            <div className="rounded-2xl border border-[#efefef] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#e6f4ea] text-[#188038] flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="text-[14px] font-bold text-[#111]">Photo Spots</h3>
              </div>
              <p className="text-sm text-[#767676] mb-3">
                Discover hidden shooting locations across Tokyo, shared by the community.
              </p>
              <Link
                href="/forum/TOKYO_PHOTO_SPOTS"
                className="text-sm font-bold text-[#e60023] hover:underline flex items-center gap-1"
              >
                Explore spots <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
