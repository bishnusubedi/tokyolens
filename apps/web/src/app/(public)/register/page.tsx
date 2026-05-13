'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label } from '@repo/ui'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <Camera className="h-6 w-6" />
            TokyoLens
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Join the Tokyo photography community</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {register.error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{register.error.message}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" placeholder="Takeshi Yamamoto" value={form.name} onChange={set('name')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="sakura_shots" value={form.username} onChange={set('username')} required pattern="^[a-zA-Z0-9_]+$" minLength={3} maxLength={20} />
                <p className="text-xs text-muted-foreground">Letters, numbers, underscores only</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={set('password')} required minLength={8} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={register.isPending}>
                {register.isPending ? 'Creating account…' : 'Join TokyoLens'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already a member?{' '}
                <Link href="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
