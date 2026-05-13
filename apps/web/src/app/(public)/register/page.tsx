'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { useRegister } from '@/hooks/use-auth'

const inputClass =
  'w-full h-11 px-4 bg-white border border-[#91918c] rounded-[16px] text-sm text-black placeholder:text-[#91918c] focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all'

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
          <h1 className="text-[22px] font-semibold text-black mb-1">Join TokyoLens</h1>
          <p className="text-sm text-[#62625b] mb-6">Capture Tokyo. Share your vision.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {register.error && (
              <p className="text-sm text-[#9e0a0a] bg-[#9e0a0a]/10 px-3 py-2 rounded-[16px]">
                {register.error.message}
              </p>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-black mb-1.5">
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
              <label htmlFor="username" className="block text-sm font-semibold text-black mb-1.5">
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
              <p className="text-xs text-[#91918c] mt-1">Letters, numbers, underscores only</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-1.5">
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
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
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
              className="w-full h-10 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] disabled:opacity-60 transition-colors mt-2"
            >
              {register.isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-[#62625b] mt-4">
            Already a member?{' '}
            <Link href="/login" className="font-semibold text-black hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
