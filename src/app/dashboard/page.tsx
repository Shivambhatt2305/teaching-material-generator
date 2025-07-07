import { DashboardHeader } from '@/components/dashboard/header';
import { ContentGenerationForm } from '@/components/dashboard/content-generation-form';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6">
        <ContentGenerationForm />
      </main>
    </div>
  );
}
