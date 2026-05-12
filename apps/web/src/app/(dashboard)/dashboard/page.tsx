'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { useMe } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data: posts } = usePosts({ limit: 5 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{posts?.meta.total ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold capitalize">{me?.data.role?.toLowerCase() ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{me?.data.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
