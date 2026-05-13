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

const inputClass =
  'w-full h-11 px-4 bg-white border border-[#91918c] rounded-[16px] text-sm text-black placeholder:text-[#91918c] focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all'

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
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbf9] px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#e60023] font-bold text-xl">
            <Camera className="h-6 w-6" />
            TokyoLens
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-2xl">
          <h1 className="text-[22px] font-semibold text-black mb-1">Welcome to TokyoLens</h1>
          <p className="text-sm text-[#62625b] mb-6">Sign in to discover Tokyo photography</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {login.error && (
              <p className="text-sm text-[#9e0a0a] bg-[#9e0a0a]/10 px-3 py-2 rounded-[16px]">
                {login.error.message}
              </p>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full h-10 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] disabled:opacity-60 transition-colors mt-2"
            >
              {login.isPending ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-center text-[#62625b] mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-black hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-[#dadad3]">
            <p className="text-xs font-bold text-[#91918c] uppercase tracking-wider mb-3 text-center">
              Quick demo access
            </p>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex-1 px-3 py-2 rounded-[16px] bg-[#f6f6f3] hover:bg-[#e5e5e0] text-left transition-colors"
                >
                  <p className="text-xs font-bold text-black">{acc.label}</p>
                  <p className="text-xs text-[#62625b] truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
