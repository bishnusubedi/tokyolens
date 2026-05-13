'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label } from '@repo/ui'
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

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <Camera className="h-6 w-6" />
            TokyoLens
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Sign in to share your Tokyo photos</p>
        </div>

        {/* Demo credentials */}
        <div className="mb-4 rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Demo accounts — click to fill</p>
          <div className="flex gap-2 flex-wrap">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <p className="text-xs font-medium">{acc.label}</p>
                <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
                <p className="text-xs text-muted-foreground font-mono">{acc.password}</p>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {login.error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{login.error.message}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={login.isPending}>
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
              <p className="text-sm text-muted-foreground">
                No account?{' '}
                <Link href="/register" className="text-primary hover:underline">Join TokyoLens</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
