'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui';
import { useMe, useLogout } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace('/login');
    }
  }, [isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError || !data) return null;

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold text-lg">App</Link>
            <Link href="/dashboard/posts" className="text-sm text-muted-foreground hover:text-foreground">Posts</Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{data.data.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
    </div>
  );
}
