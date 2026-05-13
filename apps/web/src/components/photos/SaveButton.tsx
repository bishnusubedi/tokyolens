'use client'

import { useState, useRef, useEffect } from 'react'
import { Bookmark, Plus, Check, Lock } from 'lucide-react'
import { cn } from '@repo/ui'
import { useMyCollections, useSavedCollections, useSaveToCollection, useRemoveFromCollection, useCreateCollection } from '@/hooks/use-collections'
import { useMe } from '@/hooks/use-auth'

interface SaveButtonProps {
  photoId: string
  className?: string
}

export function SaveButton({ photoId, className }: SaveButtonProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: meData } = useMe()
  const user = meData?.data
  const { data: collectionsData } = useMyCollections()
  const { data: savedData } = useSavedCollections(photoId, !!user && open)
  const saveToCollection = useSaveToCollection()
  const removeFromCollection = useRemoveFromCollection()
  const createCollection = useCreateCollection()

  const collections = collectionsData?.data ?? []
  const savedIn = savedData?.data ?? []
  const isSavedAnywhere = savedIn.length > 0

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) return null

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen((v) => !v)
  }

  const handleSave = (e: React.MouseEvent, collectionId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const isSaved = savedIn.includes(collectionId)
    if (isSaved) {
      removeFromCollection.mutate({ collectionId, photoId })
    } else {
      saveToCollection.mutate({ collectionId, photoId })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!newName.trim()) return
    const res = await createCollection.mutateAsync({ name: newName.trim() })
    if (res.data) {
      saveToCollection.mutate({ collectionId: res.data.id, photoId })
    }
    setNewName('')
    setCreating(false)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
          isSavedAnywhere
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm',
        )}
        title="Save to collection"
      >
        <Bookmark className={cn('h-3.5 w-3.5', isSavedAnywhere && 'fill-current')} />
        Save
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-56 rounded-xl bg-popover border border-border shadow-xl py-1.5"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Save to board</p>

          <div className="max-h-52 overflow-y-auto">
            {collections.length === 0 && !creating && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No boards yet</p>
            )}
            {collections.map((col) => {
              const saved = savedIn.includes(col.id)
              return (
                <button
                  key={col.id}
                  onClick={(e) => handleSave(e, col.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    {col.isPrivate && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                    <span className="truncate">{col.name}</span>
                  </span>
                  {saved && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="border-t border-border mt-1 pt-1">
            {creating ? (
              <form onSubmit={handleCreate} className="px-3 py-1.5 flex gap-1.5">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Board name…"
                  className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
                />
                <button type="submit" className="h-7 px-2 rounded bg-primary text-primary-foreground text-xs font-medium">
                  Create
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                New board
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
