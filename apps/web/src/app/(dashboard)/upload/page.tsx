'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { Button, Input, Label } from '@repo/ui'
import { useUploadPhoto } from '@/hooks/use-photos'
import { Header } from '@/components/layout/Header'
import type { CreatePhotoInput } from '@repo/shared'

const CATEGORIES = ['STREET', 'PORTRAIT', 'LANDSCAPE', 'ARCHITECTURE', 'NATURE', 'NIGHTSCAPE', 'FOOD', 'ABSTRACT', 'EVENT', 'OTHER'] as const

export default function UploadPage() {
  const router = useRouter()
  const upload = useUploadPhoto()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
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
    }
    const result = await upload.mutateAsync({ file, data })
    router.push(`/photos/${result.data.id}`)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Upload a Photo</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Drop your photo here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 10 MB</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-muted">
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
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                {file.name}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={set('title')} placeholder="Rainy night in Shinjuku" required maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood *</Label>
              <Input id="neighborhood" value={form.neighborhood} onChange={set('neighborhood')} placeholder="Shinjuku" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={form.category}
                onChange={set('category')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={set('description')}
                placeholder="Tell the story behind this shot…"
                rows={3}
                maxLength={2000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3 text-muted-foreground">EXIF / Camera Info (optional)</p>
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
                  <Label htmlFor={id} className="text-xs">{label}</Label>
                  <Input
                    id={id}
                    value={form[id as keyof typeof form] as string ?? ''}
                    onChange={set(id as keyof CreatePhotoInput)}
                    placeholder={placeholder}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {upload.error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{upload.error.message}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!file || !form.title || !form.neighborhood || upload.isPending}
          >
            {upload.isPending ? 'Uploading…' : 'Submit for Review'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Photos are reviewed before appearing publicly.</p>
        </form>
      </div>
    </>
  )
}
