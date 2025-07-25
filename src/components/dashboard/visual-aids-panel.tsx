import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

interface VisualAidsPanelProps {
    visualAids: string[];
    isLoading: boolean;
}

export function VisualAidsPanel({ visualAids, isLoading }: VisualAidsPanelProps) {
  return (
    <Card className="min-h-[600px]">
      <CardHeader>
        <CardTitle>Generated Visuals & Graphs</CardTitle>
        <CardDescription>Visuals generated from your content.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="aspect-video w-full rounded-md" />
            </div>
        )}
        {visualAids.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {visualAids.map((src, index) => (
                    <div key={index} className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-105">
                        <Image src={src} alt={`Generated visual aid ${index + 1}`} layout="fill" objectFit="cover" />
                    </div>
                ))}
            </div>
        ) : !isLoading && (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium">Your generated visuals will appear here.</p>
            <p className="text-sm">Select text from your content to create a visual or graph.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
