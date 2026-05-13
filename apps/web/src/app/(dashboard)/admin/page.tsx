'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  BarChart3, Users, Camera, Clock, Check, EyeOff, Trash2, Ban,
  MessageSquare, BookOpen, Layers, TrendingUp, ShieldCheck,
  Search, ChevronDown, UserCog, Activity, MessageCircle,
} from 'lucide-react'
import { Button, Input } from '@repo/ui'
import {
  useAnalytics, useModerationPhotos, useModeratePhoto, useBanUser,
  useChangeRole, useAdminUsers, useAdminPhotos, useAdminThreads,
  useAdminActivity,useDeleteThread,
} from '@/hooks/use-awards'
import type { UserRow, AdminPhoto, AdminThread } from '@/hooks/use-awards'
import { Header } from '@/components/layout/Header'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

type Tab = 'overview' | 'photos' | 'users' | 'forum'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'forum', label: 'Forum', icon: MessageSquare },
]

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-600',
    BANNED: 'bg-red-500/10 text-red-500',
    APPROVED: 'bg-green-500/10 text-green-600',
    PENDING: 'bg-yellow-500/10 text-yellow-600',
    HIDDEN: 'bg-orange-500/10 text-orange-500',
    DELETED: 'bg-red-500/10 text-red-500',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-500/10 text-purple-600',
    MODERATOR: 'bg-blue-500/10 text-blue-600',
    USER: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[role] ?? 'bg-muted text-muted-foreground'}`}>
      {role}
    </span>
  )
}

function imgSrc(url: string | null | undefined, fallback: string) {
  const src = url ?? fallback
  return src.startsWith('http') ? src : `${API_URL}${src}`
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: analyticsData } = useAnalytics()
  const { data: activityData } = useAdminActivity()
  const { data: pendingData } = useModerationPhotos()
  const moderate = useModeratePhoto()

  const a = analyticsData?.data
  const activity = activityData?.data
  const pending = (pendingData?.data ?? []) as any[]

  const stats = [
    { label: 'Total Users', value: a?.totalUsers ?? '—', icon: Users, sub: `+${a?.newUsersThisMonth ?? 0} this month` },
    { label: 'Approved Photos', value: a?.totalPhotos ?? '—', icon: Camera, sub: `+${a?.newPhotosThisWeek ?? 0} this week` },
    { label: 'Pending Review', value: a?.pendingPhotos ?? '—', icon: Clock, sub: 'awaiting moderation', urgent: (a?.pendingPhotos ?? 0) > 0 },
    { label: 'Daily Active Users', value: a?.dau ?? '—', icon: TrendingUp, sub: 'voted in last 24h' },
    { label: 'Total Votes', value: a?.totalVotes ?? '—', icon: BarChart3, sub: 'all time' },
    { label: 'Comments', value: a?.totalComments ?? '—', icon: MessageCircle, sub: 'all photos' },
    { label: 'Forum Threads', value: a?.totalThreads ?? '—', icon: BookOpen, sub: 'discussions' },
    { label: 'Collections', value: a?.totalCollections ?? '—', icon: Layers, sub: 'user boards' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub, urgent }) => (
          <div key={label} className={`rounded-xl border bg-card p-5 ${urgent ? 'border-yellow-500/40' : 'border-border'}`}>
            <Icon className={`h-5 w-5 mb-2 ${urgent ? 'text-yellow-500' : 'text-primary'}`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending queue */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-500" />Pending Queue ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">All clear — no pending photos.</p>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 5).map((photo: any) => (
                <div key={photo.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card">
                  <Link href={`/photos/${photo.id}`}>
                    <Image src={imgSrc(photo.thumbnailUrl ?? photo.imageUrl, '')} alt={photo.title} width={48} height={48} className="rounded-md object-cover h-12 w-12 flex-shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{photo.title}</p>
                    <p className="text-xs text-muted-foreground">@{photo.author?.username}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => moderate.mutate({ id: photo.id, action: 'APPROVE' })} disabled={moderate.isPending}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => moderate.mutate({ id: photo.id, action: 'DELETE' })} disabled={moderate.isPending}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Recent Registrations</h3>
          <div className="space-y-2">
            {(activity?.recentUsers ?? []).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{u.username[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">@{u.username}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <RoleBadge role={u.role} />
                  <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Photos Tab ───────────────────────────────────────────────────────────────

function PhotosTab() {
  const [photoStatus, setPhotoStatus] = useState('PENDING')
  const { data: photosData, isLoading } = useAdminPhotos(photoStatus)
  const moderate = useModeratePhoto()

  const photos = (photosData?.data?.data ?? photosData?.data ?? []) as AdminPhoto[]

  const statusTabs = ['PENDING', 'APPROVED', 'HIDDEN', 'DELETED']

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {statusTabs.map((s) => (
          <button key={s} onClick={() => setPhotoStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${photoStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No photos with status {photoStatus}.</p>
      ) : (
        <div className="space-y-2">
          {photos.map((photo) => (
            <div key={photo.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
              <Link href={`/photos/${photo.id}`}>
                <Image src={imgSrc(photo.thumbnailUrl ?? photo.imageUrl, '')} alt={photo.title} width={56} height={56} className="rounded-md object-cover h-14 w-14 flex-shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{photo.title}</p>
                <p className="text-xs text-muted-foreground">@{photo.author.username} · {photo.neighborhood} · {photo.category}</p>
                <p className="text-xs text-muted-foreground">{photo.voteCount} votes · {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}</p>
              </div>
              <StatusBadge status={photo.status} />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {photo.status !== 'APPROVED' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs text-green-500 border-green-500/30 hover:bg-green-500/10"
                    onClick={() => moderate.mutate({ id: photo.id, action: 'APPROVE' })} disabled={moderate.isPending}>
                    <Check className="h-3 w-3 mr-1" />Approve
                  </Button>
                )}
                {photo.status !== 'HIDDEN' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                    onClick={() => moderate.mutate({ id: photo.id, action: 'HIDE' })} disabled={moderate.isPending}>
                    <EyeOff className="h-3 w-3 mr-1" />Hide
                  </Button>
                )}
                {photo.status !== 'DELETED' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => moderate.mutate({ id: photo.id, action: 'DELETE' })} disabled={moderate.isPending}>
                    <Trash2 className="h-3 w-3 mr-1" />Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const { data: usersData } = useAdminUsers({
    search: search || undefined,
    role: filterRole || undefined,
    status: filterStatus || undefined,
  })
  const banUser = useBanUser()
  const changeRole = useChangeRole()

  const users = (usersData?.data?.data ?? usersData?.data ?? []) as UserRow[]

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, username, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MODERATOR">Moderator</option>
          <option value="USER">User</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 px-3 rounded-md border border-border bg-card text-sm">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="px-4 py-3">
                  <div>
                    <Link href={`/users/${u.username}`} className="font-medium hover:text-primary">@{u.username}</Link>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.name && <p className="text-xs text-muted-foreground">{u.name}</p>}
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</td>
                <td className="px-4 py-3">
                  {u.role !== 'ADMIN' && (
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={() => banUser.mutate({ id: u.id, ban: u.status === 'ACTIVE' })}
                        disabled={banUser.isPending}>
                        <Ban className="h-3 w-3 mr-1" />
                        {u.status === 'ACTIVE' ? 'Ban' : 'Unban'}
                      </Button>
                      <div className="relative">
                        <Button size="sm" variant="ghost" className="h-7 text-xs"
                          onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}>
                          <UserCog className="h-3 w-3 mr-1" />Role<ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                        {openDropdown === u.id && (
                          <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-border bg-card shadow-lg">
                            {(['USER', 'MODERATOR'] as const).map((r) => (
                              <button key={r} className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                                onClick={() => { changeRole.mutate({ id: u.id, role: r }); setOpenDropdown(null) }}>
                                Set as {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Forum Tab ────────────────────────────────────────────────────────────────

function ForumTab() {
  const { data: threadsData, isLoading } = useAdminThreads()
  const deleteThread = useDeleteThread()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const threads = (threadsData?.data?.data ?? threadsData?.data ?? []) as AdminThread[]

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{threads.length} threads across all categories</p>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <div key={thread.id} className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card">
              <div className="flex-1 min-w-0">
                <Link href={`/forum/threads/${thread.id}`} className="font-medium text-sm hover:text-primary truncate block">
                  {thread.pinned && <ShieldCheck className="inline h-3.5 w-3.5 mr-1 text-primary" />}{thread.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  @{thread.author.username} in <span className="font-medium">{thread.category?.name}</span>
                  {' · '}{thread.replyCount} replies
                  {' · '}{formatDistanceToNow(new Date(thread.lastReplyAt || thread.createdAt), { addSuffix: true })}
                </p>
              </div>
              {confirmId === thread.id ? (
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => { deleteThread.mutate(thread.id); setConfirmId(null) }}>
                    Confirm Delete
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmId(null)}>Cancel</Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => setConfirmId(thread.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex gap-1 border-b border-border mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'photos' && <PhotosTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'forum' && <ForumTab />}
      </div>
    </>
  )
}
