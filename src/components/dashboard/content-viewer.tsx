'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ContentViewerProps {
  content: string;
  isLoading: boolean;
  onGenerateVisual: (text: string) => Promise<void>;
}

export function ContentViewer({ content, isLoading, onGenerateVisual }: ContentViewerProps) {
  const [selectedText, setSelectedText] = useState('');
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

  const handlePrint = () => {
    const contentElement = document.getElementById('content-to-print');
    if (!contentElement) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>TeachMate AI Material</title>');
      printWindow.document.write('<style>body { font-family: "PT Sans", sans-serif; line-height: 1.6; } h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; } ul { padding-left: 20px; } li { margin-bottom: 0.5em; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(contentElement.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSelection = () => {
    const text = window.getSelection()?.toString().trim();
    // Only enable for reasonably sized selections
    if (text && text.length > 10 && text.length < 300) {
      setSelectedText(text);
    } else {
      setSelectedText('');
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedText) return;
    setIsGeneratingVisual(true);
    await onGenerateVisual(selectedText);
    setSelectedText('');
    setIsGeneratingVisual(false);
  };

  const renderFormattedContent = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      line = line.trim();
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b pb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="my-2 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Generated Content</CardTitle>
        <div className="flex gap-2">
          {selectedText && (
            <Button size="sm" onClick={handleGenerateClick} disabled={isGeneratingVisual} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isGeneratingVisual ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Visual for Selection
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={!content || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent onMouseUp={handleSelection} onTouchEnd={handleSelection}>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-[60%]" />
            <Skeleton className="h-4 w-[80%] mt-4" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[85%] mt-4" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : content ? (
            <div id="content-to-print" className="prose dark:prose-invert max-w-none">
              {renderFormattedContent(content)}
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
