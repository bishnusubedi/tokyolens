'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMe } from '@/hooks/use-auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoading, isError } = useMe()

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace('/login')
    }
  }, [isLoading, isError, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isError) return null

  return <>{children}</>
}
