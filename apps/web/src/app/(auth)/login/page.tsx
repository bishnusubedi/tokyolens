'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { useLogin } from '@/hooks/use-auth'

const DEMO_ACCOUNTS = [
  { label: 'Photographer', email: 'demo@tokyolens.jp', password: 'demo123456' },
  { label: 'Admin', email: 'admin@tokyolens.jp', password: 'admin123456' },
]

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync({ email, password })
      router.push('/')
    } catch {
      // error shown from mutation state
    }
  }

  const fillDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#e60023] flex items-center justify-center shadow-md">
            <Camera className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[28px] font-bold text-[#111] text-center leading-tight mb-2">
          Welcome to TokyoLens
        </h1>
        <p className="text-[15px] text-[#767676] text-center mb-8">
          Discover Tokyo through the lens
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {login.error && (
            <div className="rounded-2xl bg-[#fff0f1] border border-[#f9c3c9] px-4 py-3 text-sm text-[#ad081b] font-medium">
              {login.error.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#111] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[52px] px-4 rounded-2xl border border-[#cdcdd4] bg-white text-[#111] text-sm placeholder:text-[#cdcdd4] outline-none focus:border-[#111] focus:ring-0 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-[#111]">
                Password
              </label>
              <button type="button" className="text-xs font-semibold text-[#767676] hover:text-[#111] transition-colors">
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-[52px] px-4 rounded-2xl border border-[#cdcdd4] bg-white text-[#111] text-sm placeholder:text-[#cdcdd4] outline-none focus:border-[#111] focus:ring-0 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full h-[52px] rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] active:bg-[#8d0617] disabled:opacity-60 transition-colors mt-2"
          >
            {login.isPending ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#efefef]" />
          <span className="text-xs font-bold text-[#767676] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#efefef]" />
        </div>

        {/* Demo accounts */}
        <div className="mb-6">
          <p className="text-xs font-bold text-[#767676] text-center mb-3">Quick demo access</p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                className="flex-1 px-3 py-3 rounded-2xl border border-[#efefef] bg-white hover:bg-[#f8f8f8] text-left transition-colors"
              >
                <p className="text-xs font-bold text-[#111]">{acc.label}</p>
                <p className="text-xs text-[#767676] truncate mt-0.5">{acc.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-center text-[#767676]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-[#111] hover:underline">
            Sign up
          </Link>
        </p>

      </div>

      {/* Bottom nav */}
      <div className="mt-12 text-center">
        <Link href="/" className="text-xs text-[#767676] hover:text-[#111] transition-colors">
          ← Back to TokyoLens
        </Link>
      </div>
    </div>
  )
}
