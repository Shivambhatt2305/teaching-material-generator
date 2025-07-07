import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentViewerProps {
  content: string;
  isLoading: boolean;
}

export function ContentViewer({ content, isLoading }: ContentViewerProps) {
  const handlePrint = () => {
    const contentElement = document.getElementById('content-to-print');
    if (!contentElement) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>TeachMate AI Material</title>');
      printWindow.document.write('<style>body { font-family: "PT Sans", sans-serif; line-height: 1.6; } pre { white-space: pre-wrap; word-wrap: break-word; font-family: "PT Sans", sans-serif; font-size: 1rem; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(contentElement.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Content</CardTitle>
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={!content || isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : content ? (
            <div id="content-to-print" className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-body text-sm">{content}</pre>
            </div>
        ) : (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center text-muted-foreground">
            <p className="font-medium">Your generated teaching material will appear here.</p>
            <p className="text-sm">Fill out the form and click "Generate Material".</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
