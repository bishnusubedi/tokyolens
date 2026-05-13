'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Trash2, Lock, Unlock, BookmarkCheck } from 'lucide-react'
import { useMyCollections, useCreateCollection, useDeleteCollection } from '@/hooks/use-collections'
import { Header } from '@/components/layout/Header'

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
    <>
      <Header />
      <div className="mx-auto px-4 py-8 max-w-[1280px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#000000]">My Boards</h1>
            <p className="text-[#62625b] text-sm mt-1">Organize photos you love into boards</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 h-10 px-5 bg-[#e60023] text-white rounded-[16px] text-sm font-medium hover:bg-[#cc001f] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Board
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 p-5 bg-[#f6f6f3] rounded-[16px] space-y-3">
            <h3 className="font-semibold text-[#000000]">Create a new board</h3>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Board name…"
              maxLength={80}
              className="w-full h-10 rounded-[16px] border border-[#dadad3] bg-white px-4 text-sm focus:outline-none focus:border-[#e60023] transition-colors"
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-[#62625b]">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
              <Lock className="h-3.5 w-3.5" />
              Private board
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!name.trim() || createCollection.isPending}
                className="h-10 px-5 bg-[#e60023] text-white rounded-[16px] text-sm font-medium hover:bg-[#cc001f] disabled:opacity-50 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 px-5 bg-[#e5e5e0] text-[#000000] rounded-[16px] text-sm font-medium hover:bg-[#dadad3] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#f6f6f3] rounded-[16px] aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <BookmarkCheck className="h-12 w-12 text-[#dadad3]" />
            <p className="text-[#62625b]">No boards yet. Save photos to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="group relative bg-[#f6f6f3] rounded-[16px] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#e60023] transition-all"
              >
                <Link href={`/collections/${col.id}`} className="block">
                  <div className="aspect-[4/3] bg-[#e5e5e0] relative overflow-hidden">
                    {col.coverUrl ? (
                      <Image
                        src={imgUrl(col.coverUrl)}
                        alt={col.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookmarkCheck className="h-8 w-8 text-[#dadad3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5">
                      {col.isPrivate ? (
                        <Lock className="h-3.5 w-3.5 text-[#62625b] flex-shrink-0" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5 text-[#62625b] flex-shrink-0" />
                      )}
                      <p className="font-semibold text-sm text-[#000000] truncate">{col.name}</p>
                    </div>
                    <p className="text-xs text-[#62625b] mt-0.5">{col.itemCount} photo{col.itemCount !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(col.id, col.name)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-[#e60023]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
