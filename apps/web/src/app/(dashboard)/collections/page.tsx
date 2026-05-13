'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Trash2, Lock, Unlock, BookmarkCheck } from 'lucide-react'
import { Button } from '@repo/ui'
import { useMyCollections, useCreateCollection, useDeleteCollection } from '@/hooks/use-collections'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'
function imgUrl(url: string) { return url.startsWith('http') ? url : `${API_URL}${url}` }

export default function CollectionsPage() {
  const { data, isLoading } = useMyCollections()
  const createCollection = useCreateCollection()
  const deleteCollection = useDeleteCollection()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const collections = data?.data ?? []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await createCollection.mutateAsync({ name: name.trim(), isPrivate })
    setName('')
    setIsPrivate(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string, colName: string) => {
    if (!confirm(`Delete "${colName}"? All saved photos will be removed from this board.`)) return
    await deleteCollection.mutateAsync(id)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Boards</h1>
          <p className="text-muted-foreground text-sm mt-1">Organize photos you love into boards</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Board
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 rounded-xl border border-border bg-card space-y-3">
          <h3 className="font-medium">Create a new board</h3>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Board name…"
            maxLength={80}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Private board
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!name.trim() || createCollection.isPending}>Create</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No boards yet. Save photos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors">
              <Link href={`/collections/${col.id}`} className="block">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {col.coverUrl ? (
                    <Image
                      src={imgUrl(col.coverUrl)}
                      alt={col.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookmarkCheck className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    {col.isPrivate ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <p className="font-medium text-sm truncate">{col.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{col.itemCount} photo{col.itemCount !== 1 ? 's' : ''}</p>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(col.id, col.name)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
