'use client';

import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  if (!isMounted) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
                <div className="text-center text-sm text-muted-foreground pt-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>Sign in to continue to Shayak Material Generator.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="teacher@school.edu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-accent" onClick={() => {
                // In a real app, this would go to a signup page
                alert("This would redirect to a sign up page.");
            }}>
              Sign Up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
