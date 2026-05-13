'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button, Input, Label } from '@repo/ui'
import { useCreateThread } from '@/hooks/use-forum'
import { Header } from '@/components/layout/Header'

export default function NewThreadPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const create = useCreateThread()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await create.mutateAsync({ title, body, categorySlug: slug })
    router.push(`/forum/${slug}`)
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/forum/${slug}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">New Thread</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {create.error && (
            <p className="text-sm text-destructive">{create.error.message}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title (min 5 characters)"
              required
              minLength={5}
              maxLength={150}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post… (min 10 characters)"
              required
              minLength={10}
              maxLength={10000}
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
          </div>
          <Button type="submit" className="bg-gold text-zinc-950 hover:bg-gold-light" disabled={create.isPending}>
            {create.isPending ? 'Posting…' : 'Post Thread'}
          </Button>
        </form>
      </div>
    </>
  )
}
