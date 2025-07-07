import { LoginForm } from '@/components/auth/login-form';
import { BookOpenCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex w-full max-w-md flex-col items-center space-y-6">
        <div className="flex items-center space-x-3 text-primary">
          <BookOpenCheck className="h-10 w-10" />
          <h1 className="text-4xl font-bold font-headline">Shayak Material Generator</h1>
        </div>
        <p className="text-center text-muted-foreground max-w-sm">
          Your AI-powered assistant for creating high-quality, engaging teaching materials. Generate full presentations, lesson plans, and stunning visual aids in minutes, not hours.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
