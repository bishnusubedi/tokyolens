'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Upload, LayoutDashboard, LogOut, User, BookmarkCheck } from 'lucide-react'
import { Button } from '@repo/ui'
import { useMe, useLogout } from '@/hooks/use-auth'
import { cn } from '@repo/ui'

export function Header() {
  const pathname = usePathname()
  const { data } = useMe()
  const logout = useLogout()
  const user = data?.data

  const nav = [
    { href: '/', label: 'Gallery' },
    { href: '/forum', label: 'Forum' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <Camera className="h-5 w-5" />
            <span>TokyoLens</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-full transition-colors',
                  pathname === href
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href="/upload" className="flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Upload</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href="/dashboard/collections" className="flex items-center gap-1.5">
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Boards</span>
                </Link>
              </Button>
              {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                <Button variant="ghost" size="sm" asChild className="rounded-full">
                  <Link href="/admin">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href={`/users/${user.username}`}>
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline ml-1.5">{user.username}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => { logout(); window.location.href = '/' }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-full font-semibold">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
