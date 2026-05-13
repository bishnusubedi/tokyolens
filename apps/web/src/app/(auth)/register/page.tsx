'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { useRegister } from '@/hooks/use-auth'

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()
  const [form, setForm] = useState({ email: '', username: '', name: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register.mutateAsync(form)
      router.push('/')
    } catch {
      // error shown from mutation state
    }
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const inputClass =
    'w-full h-[52px] px-4 rounded-2xl border border-[#cdcdd4] bg-white text-[#111] text-sm placeholder:text-[#cdcdd4] outline-none focus:border-[#111] focus:ring-0 transition-colors'

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
          Find new ideas to capture
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {register.error && (
            <div className="rounded-2xl bg-[#fff0f1] border border-[#f9c3c9] px-4 py-3 text-sm text-[#ad081b] font-medium">
              {register.error.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#111] mb-1.5">
              Display name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Takeshi Yamamoto"
              value={form.name}
              onChange={set('name')}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-[#111] mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="sakura_shots"
              value={form.username}
              onChange={set('username')}
              required
              pattern="^[a-zA-Z0-9_]+$"
              minLength={3}
              maxLength={20}
              className={inputClass}
            />
            <p className="text-xs text-[#767676] mt-1.5 ml-1">Letters, numbers and underscores only</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#111] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#111] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full h-[52px] rounded-full bg-[#e60023] text-white text-sm font-bold hover:bg-[#ad081b] active:bg-[#8d0617] disabled:opacity-60 transition-colors mt-2"
          >
            {register.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-[#767676] text-center mt-5 leading-relaxed px-4">
          By continuing, you agree to TokyoLens&apos;s{' '}
          <span className="font-semibold text-[#111]">Terms of Service</span> and acknowledge you&apos;ve read our{' '}
          <span className="font-semibold text-[#111]">Privacy Policy</span>.
        </p>

        {/* Divider */}
        <div className="h-px bg-[#efefef] my-6" />

        {/* Footer */}
        <p className="text-sm text-center text-[#767676]">
          Already a member?{' '}
          <Link href="/login" className="font-bold text-[#111] hover:underline">
            Log in
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
