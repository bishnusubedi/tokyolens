'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, ChevronDown, Camera, X, Plus } from 'lucide-react'
import { cn } from '@repo/ui'
import { useMe, useLogout } from '@/hooks/use-auth'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data } = useMe()
  const logout = useLogout()
  const user = data?.data
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Three-column flex: left (fixed) | center (grows) | right (fixed) */}
      <div className="flex items-center h-16 px-4 gap-3">

        {/* ── Left: logo + nav tabs ── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href="/"
            aria-label="TokyoLens home"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#e60023] hover:bg-[#f6f6f3] transition-colors flex-shrink-0"
          >
            <Camera className="h-6 w-6" />
          </Link>

          {user ? (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors',
                  pathname === '/'
                    ? 'bg-[#111] text-white'
                    : 'text-[#767676] hover:bg-[#f6f6f3] hover:text-[#111]',
                )}
              >
                Today
              </Link>
              <Link
                href="/feed"
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors',
                  pathname === '/feed'
                    ? 'bg-[#111] text-white'
                    : 'text-[#767676] hover:bg-[#f6f6f3] hover:text-[#111]',
                )}
              >
                Following
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/forum"
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors',
                  pathname === '/forum'
                    ? 'bg-[#111] text-white'
                    : 'text-[#767676] hover:bg-[#f6f6f3] hover:text-[#111]',
                )}
              >
                Forum
              </Link>
            </nav>
          )}
        </div>

        {/* ── Center: search bar (fills remaining space, search centered within) ── */}
        <div className="flex-1 flex justify-center min-w-0 px-2">
          <form onSubmit={handleSearch} className="w-full max-w-[560px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#767676] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full h-12 pl-11 pr-10 bg-[#efefef] rounded-full text-sm text-[#111] placeholder:text-[#767676] border-2 border-transparent focus:border-[#0076d3] focus:bg-white focus:outline-none transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Right: action buttons ── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {user ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-bold text-[#111] hover:bg-[#f6f6f3] transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Create
              </Link>

              <button className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full text-[#111] hover:bg-[#f6f6f3] transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              {/* Avatar + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1 h-10 pl-1 pr-2 rounded-full hover:bg-[#f6f6f3] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#e60023] flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username[0]?.toUpperCase()
                    )}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#767676]" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] border border-[#efefef] z-50 py-2">
                      <Link
                        href={`/users/${user.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#111] hover:bg-[#f6f6f3] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#e60023] flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.username[0]?.toUpperCase()
                          )}
                        </div>
                        <span>{user.name}</span>
                      </Link>
                      <div className="h-px bg-[#efefef] my-1" />
                      <Link href="/collections" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#111] hover:bg-[#f6f6f3] transition-colors">Boards</Link>
                      <Link href="/upload" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#111] hover:bg-[#f6f6f3] transition-colors">Upload</Link>
                      <Link href="/forum" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#111] hover:bg-[#f6f6f3] transition-colors">Forum</Link>
                      {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#111] hover:bg-[#f6f6f3] transition-colors">Admin</Link>
                      )}
                      <div className="h-px bg-[#efefef] my-1" />
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); window.location.href = '/' }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#111] hover:bg-[#f6f6f3] transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2.5 rounded-full text-sm font-bold text-[#111] hover:bg-[#f6f6f3] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2.5 rounded-full text-sm font-bold bg-[#e60023] text-white hover:bg-[#ad081b] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
