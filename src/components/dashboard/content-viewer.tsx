'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ImageIcon, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';

export interface Slide {
  id: number;
  content: string;
  visualAidSuggestion: string;
  visuals: string[];
}

interface ContentViewerProps {
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  isLoading: boolean;
  onGenerateVisual: (text: string, slideIndex: number) => Promise<void>;
  onGenerateGraph: (text: string, slideIndex: number) => Promise<void>;
}

export function ContentViewer({ slides, isLoading }: ContentViewerProps) {
  const [generatingForSlide, setGeneratingForSlide] = useState<number | null>(null);

  const handlePrint = () => {
    if (slides.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to export your presentation.');
      return;
    }

    const renderContentToHtml = (content: string) => {
      let html = '';
      const lines = content.split('\n');
      let inList = false;

      const closeList = () => {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
      };

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('## ')) {
          closeList();
          html += `<h2 class="slide-title">${trimmedLine.substring(3)}</h2>`;
        } else if (trimmedLine.startsWith('### ')) {
          closeList();
          html += `<h3 class="slide-subtitle">${trimmedLine.substring(4)}</h3>`;
        } else if (trimmedLine.startsWith('- ')) {
          if (!inList) {
            html += '<ul class="slide-bullets">';
            inList = true;
          }
          const listItem = trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          html += `<li>${listItem}</li>`;
        } else if (trimmedLine) {
          closeList();
          const pItem = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          html += `<p>${pItem}</p>`;
        }
      });
      closeList();
      return html;
    };

    const slidesHtml = slides.map((slide, index) => {
      const contentHtml = renderContentToHtml(slide.content);
      const visualsHtml = slide.visuals.length > 0
        ? `<div class="slide-visuals">${slide.visuals.map(src => `<div class="visual-container"><img src="${src}" alt="Visual Aid" /></div>`).join('')}</div>`
        : '';
      
      const bookIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4Z"/>
          <path d="m16 12 2 2 4-4"/>
          <path d="M22 6V3h-6c-2.2 0-4 1.8-4 4v14c0-1.7 1.3-3 3-3h7v-2.3"/>
        </svg>
      `;

      return `
        <div class="slide">
          <div class="slide-main-content">
            <div class="slide-content-text">${contentHtml}</div>
            ${visualsHtml}
          </div>
          <div class="slide-footer">
            <div class="logo">${bookIconSvg}<span>Shayak Material Generator</span></div>
            <div class="slide-number">${index + 1}</div>
          </div>
        </div>
      `;
    }).join('');

    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        body { 
          font-family: 'PT Sans', sans-serif; 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .slide {
          box-sizing: border-box;
          width: 100vw;
          height: 100vh;
          padding: 4rem 5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          page-break-after: always;
          overflow: hidden;
          background-color: #fff;
        }
        .slide:last-of-type {
          page-break-after: auto;
        }
        .slide-main-content {
          width: 100%;
          height: calc(100% - 4rem);
          display: flex;
          flex-direction: column;
        }
        .slide-content-text {
          flex-shrink: 0;
        }
        .slide-title {
          font-size: 2.5em;
          font-weight: 700;
          color: #1E293B; /* slate-800 */
          margin-bottom: 1.5rem;
          border-bottom: 3px solid #F59E0B; /* amber-500 */
          padding-bottom: 0.5rem;
        }
        .slide-subtitle {
          font-size: 1.8em;
          font-weight: 600;
          color: #334155; /* slate-700 */
          margin-bottom: 1rem;
        }
        .slide-bullets {
          list-style: none;
          padding-left: 0;
        }
        .slide-bullets li {
          font-size: 1.3em;
          line-height: 1.6;
          color: #475569; /* slate-600 */
          margin-bottom: 0.75em;
          padding-left: 2em;
          position: relative;
        }
        .slide-bullets li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #F59E0B; /* amber-500 */
          font-size: 1.5em;
          line-height: 1;
        }
        .slide-visuals {
          padding-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          flex: 1;
          min-height: 0;
        }
        .visual-container {
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          max-height: 100%;
          flex: 1 1 45%;
        }
        .visual-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .slide-footer {
          position: absolute;
          bottom: 1.5rem;
          left: 5rem;
          right: 5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9em;
          color: #64748B; /* slate-500 */
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }
        .logo svg {
          width: 1.2em;
          height: 1.2em;
        }
        @page {
          size: landscape;
          margin: 0;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    `;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Shayak Material Generator Material</title>
          ${styles}
        </head>
        <body>
          ${slidesHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  const handleGenerateVisualClick = async (prompt: string, slideIndex: number) => {
    if (!prompt) return;
    setGeneratingForSlide(slideIndex);
    await onGenerateVisual(prompt, slideIndex);
    setGeneratingForSlide(null);
  };
  
  const handleGenerateGraphClick = async (prompt: string, slideIndex: number) => {
    if (!prompt) return;
    setGeneratingForSlide(slideIndex);
    await onGenerateGraph(prompt, slideIndex);
    setGeneratingForSlide(null);
  };

  const renderSlideContent = (slideContent: string) => {
    const elements: React.ReactNode[] = [];
    const lines = slideContent.split('\n');
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${elements.length}`} className="list-disc ml-6 space-y-2">{listItems}</ul>);
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-2xl font-bold mt-4 mb-3 border-b pb-2">{trimmedLine.substring(3)}</h2>);
      } else if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-xl font-semibold mt-4 mb-2">{trimmedLine.substring(4)}</h3>);
      } else if (trimmedLine.startsWith('- ')) {
        const parts = trimmedLine.substring(2).split(/(\*\*.*?\*\*)/g);
        listItems.push(
          <li key={index} className="leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </li>
        );
      } else if (trimmedLine) {
        flushList();
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={index} className="my-2 leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  const renderFormattedContent = () => {
    return slides.map((slide, slideIndex) => (
      <Card key={slide.id} className="slide mb-6 shadow-md break-inside-avoid">
        <CardContent className="p-6 pb-4">
          <div className="prose dark:prose-invert max-w-none">
            {renderSlideContent(slide.content)}
          </div>
          {slide.visuals.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 slide-visuals">
              {slide.visuals.map((src, i) => (
                <div key={i} className="relative aspect-video w-full overflow-hidden rounded-lg border visual-wrapper">
                  <Image src={src} alt={`Generated visual ${i + 1}`} fill objectFit="contain" />
                </div>
              ))}
            </div>
          )}
          {generatingForSlide === slideIndex && (
            <div className="mt-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Generating... This can take up to 30 seconds.</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 p-6 pt-2 no-print">
          <div className="w-full text-sm text-muted-foreground">
            <p className="font-semibold">Suggested Visual Prompt:</p>
            <p className="italic">"{slide.visualAidSuggestion}"</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => handleGenerateVisualClick(slide.visualAidSuggestion, slideIndex)}
              disabled={generatingForSlide !== null}
              className="bg-primary hover:bg-primary/90"
            >
              {generatingForSlide === slideIndex ? <Loader2 className="animate-spin" /> : <ImageIcon />}
              Create Visual
            </Button>
            <Button
              size="sm"
              onClick={() => handleGenerateGraphClick(slide.visualAidSuggestion, slideIndex)}
              disabled={generatingForSlide !== null}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {generatingForSlide === slideIndex ? <Loader2 className="animate-spin" /> : <BarChart3 />}
              Create Graph
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };


  return (
    <Card className="min-h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Generated Presentation</CardTitle>
        <div className="flex gap-2 flex-wrap no-print">
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={slides.length === 0 || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            <div>
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
function onGenerateVisual(prompt: string, slideIndex: number) {
  throw new Error('Function not implemented.');
}

function onGenerateGraph(prompt: string, slideIndex: number) {
  throw new Error('Function not implemented.');
}

