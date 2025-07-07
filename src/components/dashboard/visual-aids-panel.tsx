import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function VisualAidsPanel() {
  return (
    <Card className="min-h-[600px]">
      <CardHeader>
        <CardTitle>Visual Aids</CardTitle>
        <CardDescription>Add images and graphs to your material.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Visuals</h4>
            <div className="grid grid-cols-2 gap-2">
                <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-105">
                    <Image src="https://placehold.co/400x300.png" alt="Placeholder chart" fill objectFit="cover" data-ai-hint="chart biology"/>
                </div>
                <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-105">
                    <Image src="https://placehold.co/400x300.png" alt="Placeholder graph" fill objectFit="cover" data-ai-hint="graph data"/>
                </div>
                 <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-105">
                    <Image src="https://placehold.co/400x300.png" alt="Placeholder diagram" fill objectFit="cover" data-ai-hint="cell diagram"/>
                </div>
                 <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-transform hover:scale-105">
                    <Image src="https://placehold.co/400x300.png" alt="Placeholder illustration" fill objectFit="cover" data-ai-hint="plant photosynthesis"/>
                </div>
            </div>
        </div>
        <Button variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Your Own
        </Button>
      </CardContent>
    </Card>
  );
}
