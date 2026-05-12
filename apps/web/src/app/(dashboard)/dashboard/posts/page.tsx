'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { usePosts, useCreatePost, useDeletePost } from '@/hooks/use-posts';
import { useMe } from '@/hooks/use-auth';
import type { PostStatus } from '@repo/shared';

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', status: 'DRAFT' as PostStatus });

  const { data: me } = useMe();
  const { data, isLoading } = usePosts({ page, limit: 10 });
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost.mutateAsync(form);
    setOpen(false);
    setForm({ title: '', content: '', status: 'DRAFT' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button onClick={() => setOpen(true)}>New post</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : data?.data.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Create your first one!</p>
      ) : (
        <div className="space-y-4">
          {data?.data.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                  >
                    {post.status}
                  </Badge>
                  {(post.authorId === me?.data.id || me?.data.role === 'ADMIN') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost.mutate(post.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground py-2">
            {page} / {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.content}
                onChange={(e) => set('content')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={set('status')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
