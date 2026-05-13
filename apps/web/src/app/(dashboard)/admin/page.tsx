'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BarChart3, Users, Camera, Clock, Check, EyeOff, Trash2, Ban } from 'lucide-react'
import { Button } from '@repo/ui'
import { useAnalytics, useModerationPhotos, useModeratePhoto, useBanUser } from '@/hooks/use-awards'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { Header } from '@/components/layout/Header'
import type { ApiResponse } from '@repo/shared'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

type PendingPhoto = {
  id: string; title: string; imageUrl: string; thumbnailUrl: string | null
  neighborhood: string; createdAt: string
  author: { id: string; username: string; name: string }
}

type UserRow = {
  id: string; username: string; name: string; email: string; status: string; role: string; createdAt: string
}

export default function AdminPage() {
  const { data: analyticsData } = useAnalytics()
  const { data: pendingData, isLoading: pendingLoading } = useModerationPhotos()
  const moderate = useModeratePhoto()
  const banUser = useBanUser()

  const { data: usersData } = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: () => apiClient.get<ApiResponse<{ data: UserRow[]; total: number }>>('/api/admin/users?limit=50'),
  })

  const analytics = analyticsData?.data
  const pending = (pendingData?.data ?? []) as PendingPhoto[]
  const users = usersData?.data?.data ?? []

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: analytics?.totalUsers ?? '—', icon: Users },
            { label: 'Approved Photos', value: analytics?.totalPhotos ?? '—', icon: Camera },
            { label: 'Pending Review', value: analytics?.pendingPhotos ?? '—', icon: Clock },
            { label: 'Daily Active (votes)', value: analytics?.dau ?? '—', icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-gold mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gold" />
            Pending Photos ({pending.length})
          </h2>
          {pendingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending photos.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((photo) => {
                const src = (photo.thumbnailUrl ?? photo.imageUrl)
                return (
                  <div key={photo.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
                    <Link href={`/photos/${photo.id}`}>
                      <Image
                        src={src.startsWith('http') ? src : `${API_URL}${src}`}
                        alt={photo.title}
                        width={64}
                        height={64}
                        className="rounded-md object-cover h-16 w-16 flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{photo.title}</p>
                      <p className="text-xs text-muted-foreground">by @{photo.author.username} · {photo.neighborhood}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="h-8 text-green-500 border-green-500/30 hover:bg-green-500/10"
                        onClick={() => moderate.mutate({ id: photo.id, action: 'APPROVE' })} disabled={moderate.isPending}>
                        <Check className="h-3.5 w-3.5 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                        onClick={() => moderate.mutate({ id: photo.id, action: 'HIDE' })} disabled={moderate.isPending}>
                        <EyeOff className="h-3.5 w-3.5 mr-1" />Hide
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => moderate.mutate({ id: photo.id, action: 'DELETE' })} disabled={moderate.isPending}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gold" />
            Users
          </h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['User', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">@{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'ADMIN' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => banUser.mutate({ id: u.id, ban: u.status === 'ACTIVE' })}
                          disabled={banUser.isPending}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          {u.status === 'ACTIVE' ? 'Ban' : 'Unban'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
