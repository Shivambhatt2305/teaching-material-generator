'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ImageIcon, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';

export interface Slide {
  id: number;
  content: string;
  visuals: string[];
}

interface ContentViewerProps {
  slides: Slide[];
  isLoading: boolean;
  onGenerateVisual: (text: string, slideIndex: number) => Promise<void>;
  onGenerateGraph: (text: string, slideIndex: number) => Promise<void>;
}

export function ContentViewer({ slides, isLoading, onGenerateVisual, onGenerateGraph }: ContentViewerProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);
  const [generatingForSlide, setGeneratingForSlide] = useState<number | null>(null);

  const handlePrint = () => {
    const contentElement = document.getElementById('content-to-print');
    if (!contentElement) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>TeachMate AI Material</title>');
      printWindow.document.write('<style>body { font-family: "PT Sans", sans-serif; line-height: 1.6; } h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; } ul { padding-left: 20px; } li { margin-bottom: 0.5em; } .slide { border: 1px solid #ddd; padding: 1.5rem; margin-bottom: 2rem; border-radius: 0.5rem; } .slide-visuals { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; } .visual-wrapper { position: relative; width: 100%; padding-top: 56.25%; } .visual-wrapper img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; } @media print { .no-print { display: none; } .slide { border: none; padding: 0; margin-bottom: 1.5rem; page-break-after: always; } .slide-visuals { break-inside: avoid; } }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(contentElement.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 10 && text.length < 500) {
      let node = selection?.anchorNode;
      if (node) {
        let parentElement = node.nodeType === 3 ? node.parentElement : node as HTMLElement;
        while (parentElement) {
          if (parentElement.dataset.slideIndex) {
            setSelectedSlideIndex(parseInt(parentElement.dataset.slideIndex, 10));
            setSelectedText(text);
            return;
          }
          parentElement = parentElement.parentElement;
        }
      }
    } else {
        setSelectedText('');
        setSelectedSlideIndex(null);
    }
  };

  const handleGenerateVisualClick = async () => {
    if (!selectedText || selectedSlideIndex === null) return;
    setGeneratingForSlide(selectedSlideIndex);
    await onGenerateVisual(selectedText, selectedSlideIndex);
    setSelectedText('');
    setSelectedSlideIndex(null);
    setGeneratingForSlide(null);
  };
  
  const handleGenerateGraphClick = async () => {
    if (!selectedText || selectedSlideIndex === null) return;
    setGeneratingForSlide(selectedSlideIndex);
    await onGenerateGraph(selectedText, selectedSlideIndex);
    setSelectedText('');
    setSelectedSlideIndex(null);
    setGeneratingForSlide(null);
  };

  const renderSlideContent = (slideContent: string) => {
    return slideContent.split('\n').map((line, index) => {
      line = line.trim();
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-4 mb-3 border-b pb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        const parts = line.substring(2).split(/(\*\*.*?\*\*)/g);
        return (
          <li key={index} className="ml-6 list-disc my-2 leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </li>
        );
      }
      if (line.trim() === '') {
        return null;
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

  const renderFormattedContent = () => {
    return slides.map((slide, slideIndex) => (
      <Card key={slide.id} data-slide-index={slideIndex} className="slide mb-6 shadow-md">
        <CardContent className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            {renderSlideContent(slide.content)}
          </div>
          {slide.visuals.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 slide-visuals">
              {slide.visuals.map((src, i) => (
                <div key={i} className="relative aspect-video w-full overflow-hidden rounded-lg border visual-wrapper">
                  <Image src={src} alt={`Generated visual ${i + 1}`} layout="fill" objectFit="cover" />
                </div>
              ))}
            </div>
          )}
          {generatingForSlide === slideIndex && (
            <div className="mt-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Generating visual... Please wait.</span>
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };


  return (
    <Card className="min-h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Generated Presentation</CardTitle>
        <div className="flex gap-2 flex-wrap no-print">
          {selectedText && (
            <>
              <Button size="sm" onClick={handleGenerateVisualClick} disabled={generatingForSlide !== null} className="bg-primary hover:bg-primary/90">
                {generatingForSlide !== null && selectedSlideIndex === generatingForSlide ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                Create Visual
              </Button>
              <Button size="sm" onClick={handleGenerateGraphClick} disabled={generatingForSlide !== null} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                 {generatingForSlide !== null && selectedSlideIndex === generatingForSlide ? <Loader2 className="animate-spin" /> : <BarChart3 />}
                Create Graph
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={slides.length === 0 || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent onMouseUp={handleSelection} onTouchEnd={handleSelection}>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-[70%] mb-6" />
            <Skeleton className="h-4 w-[90%] mt-4" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-8 w-[60%] mt-8 mb-6" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        ) : slides.length > 0 ? (
            <div id="content-to-print">
              {renderFormattedContent()}
            </div>
        ) : (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center text-muted-foreground">
            <p className="font-medium">Your generated presentation will appear here.</p>
            <p className="text-sm">Fill out the form and click "Generate Material".</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
