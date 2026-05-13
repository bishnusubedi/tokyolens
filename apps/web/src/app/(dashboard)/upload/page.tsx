'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { useUploadPhoto } from '@/hooks/use-photos'
import { Header } from '@/components/layout/Header'
import type { CreatePhotoInput } from '@repo/shared'

const CATEGORIES = ['STREET', 'PORTRAIT', 'LANDSCAPE', 'ARCHITECTURE', 'NATURE', 'NIGHTSCAPE', 'FOOD', 'ABSTRACT', 'EVENT', 'OTHER'] as const

export default function UploadPage() {
  const router = useRouter()
  const upload = useUploadPhoto()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [form, setForm] = useState<Partial<CreatePhotoInput>>({
    title: '',
    neighborhood: '',
    category: 'STREET',
    description: '',
    cameraMake: '',
    cameraModel: '',
    lens: '',
    aperture: '',
    shutterSpeed: '',
    focalLength: '',
  })

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const set = (field: keyof CreatePhotoInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    const data: CreatePhotoInput = {
      title: form.title!,
      neighborhood: form.neighborhood!,
      category: form.category as CreatePhotoInput['category'],
      description: form.description || undefined,
      cameraMake: form.cameraMake || undefined,
      cameraModel: form.cameraModel || undefined,
      lens: form.lens || undefined,
      aperture: form.aperture || undefined,
      shutterSpeed: form.shutterSpeed || undefined,
      focalLength: form.focalLength || undefined,
      tags,
    }
    const result = await upload.mutateAsync({ file, data })
    router.push(`/photos/${result.data.id}`)
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-1.5 text-[#62625b] hover:text-black text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-[22px] font-semibold text-black mb-6">Upload a photo</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[16px] p-12 text-center cursor-pointer transition-colors bg-[#f6f6f3] ${
                isDragActive ? 'border-[#e60023] bg-[#e60023]/5' : 'border-[#dadad3] hover:border-[#91918c]'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3 text-[#91918c]" />
              <p className="text-sm font-semibold text-black">Drop your photo here, or click to browse</p>
              <p className="text-xs text-[#62625b] mt-1">JPG, PNG, WebP — max 10 MB</p>
            </div>
          ) : (
            <div className="relative rounded-[16px] overflow-hidden bg-[#f6f6f3]">
              {preview && (
                <Image src={preview} alt="Preview" width={800} height={600} className="w-full h-auto max-h-80 object-contain" />
              )}
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                {file.name}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="title" className="text-sm font-semibold text-black">Title *</label>
              <input id="title" value={form.title} onChange={set('title')} placeholder="Rainy night in Shinjuku" required maxLength={120}
                className="w-full h-11 px-4 bg-white border border-[#dadad3] rounded-[16px] text-sm text-black placeholder:text-[#91918c] focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="neighborhood" className="text-sm font-semibold text-black">Neighborhood *</label>
              <input id="neighborhood" value={form.neighborhood} onChange={set('neighborhood')} placeholder="Shinjuku" required
                className="w-full h-11 px-4 bg-white border border-[#dadad3] rounded-[16px] text-sm text-black placeholder:text-[#91918c] focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-semibold text-black">Category *</label>
              <select
                id="category"
                value={form.category}
                onChange={set('category')}
                className="w-full h-11 px-4 bg-white border border-[#dadad3] rounded-[16px] text-sm text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="description" className="text-sm font-semibold text-black">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={set('description')}
                placeholder="Tell the story behind this shot…"
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white border border-[#dadad3] rounded-[16px] text-sm text-black placeholder:text-[#91918c] focus:outline-none focus:border-black focus:ring-2 focus:ring-[#435ee5] focus:ring-offset-1 transition-all resize-y"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-black">Tags <span className="font-normal text-[#62625b]">(up to 10)</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="ml-1 text-white/70 hover:text-white">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() && tags.length < 10) {
                      e.preventDefault()
                      const t = tagInput.trim().replace(/,/g, '')
                      if (t && !tags.includes(t)) setTags([...tags, t])
                      setTagInput('')
                    }
                  }}
                  placeholder="Add a tag, press Enter"
                  className="flex-1 h-11 px-4 bg-white border border-[#dadad3] rounded-[16px] text-sm text-black placeholder:text-[#91918c] focus:outline-none focus:border-black transition-all"
                />
                <button type="button"
                  onClick={() => { const t = tagInput.trim(); if (t && tags.length < 10 && !tags.includes(t)) { setTags([...tags, t]); setTagInput('') } }}
                  className="h-11 px-4 rounded-[16px] bg-[#f6f6f3] text-sm font-bold text-black hover:bg-[#e5e5e0] transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-black mb-3">Camera Info <span className="font-normal text-[#62625b]">(optional)</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'cameraMake', label: 'Make', placeholder: 'Sony' },
                { id: 'cameraModel', label: 'Model', placeholder: 'A7 IV' },
                { id: 'lens', label: 'Lens', placeholder: '35mm f/1.8' },
                { id: 'aperture', label: 'Aperture', placeholder: 'f/1.8' },
                { id: 'shutterSpeed', label: 'Shutter', placeholder: '1/250s' },
                { id: 'focalLength', label: 'Focal Length', placeholder: '35mm' },
              ].map(({ id, label, placeholder }) => (
                <div key={id} className="space-y-1">
                  <label htmlFor={id} className="text-xs font-semibold text-black">{label}</label>
                  <input
                    id={id}
                    value={form[id as keyof typeof form] as string ?? ''}
                    onChange={set(id as keyof CreatePhotoInput)}
                    placeholder={placeholder}
                    className="w-full h-9 px-3 bg-white border border-[#dadad3] rounded-[16px] text-xs text-black placeholder:text-[#91918c] focus:outline-none focus:border-black transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {upload.error && (
            <p className="text-sm text-[#9e0a0a] bg-[#9e0a0a]/10 px-3 py-2 rounded-[16px]">{upload.error.message}</p>
          )}

          <button
            type="submit"
            disabled={!file || !form.title || !form.neighborhood || upload.isPending}
            className="w-full h-10 rounded-[16px] bg-[#e60023] text-white text-sm font-bold hover:bg-[#cc001f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {upload.isPending ? 'Uploading…' : 'Submit for Review'}
          </button>
          <p className="text-xs text-center text-[#62625b]">Photos are reviewed before appearing publicly.</p>
        </form>
      </div>
    </>
  )
}
