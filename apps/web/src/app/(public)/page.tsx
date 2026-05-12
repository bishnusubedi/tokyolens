import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse, Post } from '@repo/shared';

async function getPublishedPosts(): Promise<PaginatedResponse<Post>> {
  try {
    return await apiClient.get<PaginatedResponse<Post>>(
      '/api/posts?status=PUBLISHED&limit=6',
    );
  } catch {
    return { data: [], meta: { page: 1, limit: 6, total: 0, totalPages: 0 } };
  }
}

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <main className="container mx-auto py-12 px-4">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Monorepo App</h1>
        <p className="text-muted-foreground text-lg mb-8">
          A full-stack TypeScript monorepo with Next.js, Express, and Prisma.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
        {posts.data.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.data.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                  <Button variant="ghost" className="mt-4 p-0 h-auto" asChild>
                    <Link href={`/posts/${post.id}`}>Read more →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
