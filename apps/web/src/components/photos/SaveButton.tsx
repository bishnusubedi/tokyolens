'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Check, Lock } from 'lucide-react'
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
      {/* Pinterest-style red "Save" pill */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-bold transition-all shadow-sm',
          isSavedAnywhere
            ? 'bg-[#ad081b] text-white hover:bg-[#8d0617]'
            : 'bg-[#e60023] text-white hover:bg-[#ad081b]',
        )}
        title="Save to board"
      >
        {isSavedAnywhere && <Check className="h-3.5 w-3.5" />}
        {isSavedAnywhere ? 'Saved' : 'Save'}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-60 rounded-2xl bg-white border border-[#efefef] shadow-[0_4px_24px_rgba(0,0,0,0.16)] py-2"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <p className="px-4 py-1.5 text-xs font-bold text-[#767676] uppercase tracking-wider">Save to board</p>

          <div className="max-h-52 overflow-y-auto">
            {collections.length === 0 && !creating && (
              <p className="px-4 py-2 text-sm text-[#767676]">No boards yet</p>
            )}
            {collections.map((col) => {
              const saved = savedIn.includes(col.id)
              return (
                <button
                  key={col.id}
                  onClick={(e) => handleSave(e, col.id)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-[#111] hover:bg-[#f6f6f3] transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    {col.isPrivate && <Lock className="h-3 w-3 text-[#767676] flex-shrink-0" />}
                    <span className="truncate">{col.name}</span>
                  </span>
                  {saved && <Check className="h-4 w-4 text-[#e60023] flex-shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="border-t border-[#efefef] mt-1 pt-1">
            {creating ? (
              <form onSubmit={handleCreate} className="px-4 py-2 flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Board name…"
                  className="flex-1 h-8 rounded-full border border-[#efefef] bg-[#f6f6f3] px-3 text-xs focus:outline-none focus:border-[#767676]"
                />
                <button type="submit" className="h-8 px-3 rounded-full bg-[#e60023] text-white text-xs font-bold">
                  Create
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-[#111] hover:bg-[#f6f6f3] transition-colors"
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
