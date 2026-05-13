'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Upload, BookmarkCheck, LayoutDashboard, LogOut, User, Camera, X } from 'lucide-react'
import { cn } from '@repo/ui'
import { useMe, useLogout } from '@/hooks/use-auth'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data } = useMe()
  const logout = useLogout()
  const user = data?.data
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`)
    }
  }

  const navLinks = [
    { href: '/', label: 'Gallery' },
    { href: '/forum', label: 'Forum' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#dadad3]">
      <div className="max-w-[1280px] mx-auto flex items-center h-16 px-4 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#e60023] font-bold text-lg tracking-tight flex-shrink-0"
        >
          <Camera className="h-5 w-5" />
          <span className="hidden sm:inline">TokyoLens</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-2 rounded-full text-sm font-semibold transition-colors',
                pathname === href
                  ? 'bg-black text-white'
                  : 'text-[#62625b] hover:text-black hover:bg-[#f6f6f3]',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Search bar — centered, grows to fill space */}
        <form
          onSubmit={handleSearch}
          className={cn(
            'flex-1 max-w-[480px] mx-auto',
            searchOpen ? 'flex' : 'hidden sm:flex',
          )}
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#62625b] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos, neighborhoods…"
              className="w-full h-12 pl-11 pr-10 bg-[#f6f6f3] rounded-full text-sm text-black placeholder:text-[#91918c] border border-transparent focus:border-[#91918c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#91918c] hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Mobile search toggle */}
        <button
          className="sm:hidden p-2 text-[#62625b] hover:text-black"
          onClick={() => {
            setSearchOpen((v) => !v)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {user ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-[#62625b] hover:text-black hover:bg-[#f6f6f3] transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Link>
              <Link
                href="/collections"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-[#62625b] hover:text-black hover:bg-[#f6f6f3] transition-colors"
              >
                <BookmarkCheck className="h-4 w-4" />
                <span>Boards</span>
              </Link>
              {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                <Link
                  href="/admin"
                  className="p-2 rounded-full text-[#62625b] hover:text-black hover:bg-[#f6f6f3] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              )}
              <Link
                href={`/users/${user.username}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-[#f6f6f3] hover:bg-[#e5e5e0] text-black transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.username}</span>
              </Link>
              <button
                onClick={() => { logout(); window.location.href = '/' }}
                className="p-2 rounded-full text-[#62625b] hover:text-black hover:bg-[#f6f6f3] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold text-black hover:bg-[#f6f6f3] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-[16px] text-sm font-bold bg-[#e60023] text-white hover:bg-[#cc001f] transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile search bar (full-width when open) */}
      {searchOpen && (
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#62625b] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos, neighborhoods…"
              className="w-full h-12 pl-11 pr-4 bg-[#f6f6f3] rounded-full text-sm text-black placeholder:text-[#91918c] border border-transparent focus:border-[#91918c] focus:bg-white focus:outline-none transition-all"
            />
          </form>
        </div>
      )}
    </header>
  )
}
