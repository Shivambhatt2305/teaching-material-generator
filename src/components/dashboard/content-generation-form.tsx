'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

import { suggestTopics, SuggestTopicsOutput } from '@/ai/flows/suggest-topics';
import { generateTeachingContent } from '@/ai/flows/generate-teaching-content';
import { generateVisualAid } from '@/ai/flows/generate-visual-aid';
import { ContentViewer } from './content-viewer';
import { VisualAidsPanel } from './visual-aids-panel';

const formSchema = z.object({
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  standard: z.string({ required_error: 'Please select a standard.' }),
  depthLevel: z.string({ required_error: 'Please select a depth level.' }),
});

export function ContentGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isVisualAidLoading, setVisualAidLoading] = useState(false);

  const [generatedContent, setGeneratedContent] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [visualAids, setVisualAids] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      topic: '',
    },
  });

  const handleTopicSuggest = async () => {
    const subject = form.getValues('subject');
    if (subject.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Subject required',
        description: 'Please enter a subject to get topic suggestions.',
      });
      return;
    }
    setSuggestionsLoading(true);
    setTopicSuggestions([]);
    try {
      const result: SuggestTopicsOutput = await suggestTopics({ subject, mainTopic: form.getValues('topic') || subject });
      setTopicSuggestions(result.suggestedTopics);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to get suggestions.',
        description: 'There was a problem with the AI model.',
      });
    } finally {
      setSuggestionsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent('');
    setVisualAids([]); // Clear previous visuals
    try {
      const result = await generateTeachingContent(values);
      setGeneratedContent(result.teachingContent);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to generate content.',
        description: 'There was a problem with the AI model. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerateVisualAid = async (text: string) => {
    setVisualAidLoading(true);
    try {
      const result = await generateVisualAid({ text });
      setVisualAids(prev => [...prev, result.imageDataUri]);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to generate visual.',
        description: 'There was a problem with the image generation model. Please try again.',
      });
    } finally {
      setVisualAidLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Biology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Photosynthesis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" onClick={handleTopicSuggest} disabled={isSuggestionsLoading} className="w-full">
              {isSuggestionsLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Suggest Sub-Topics
            </Button>
            
            {topicSuggestions.length > 0 && (
                <div className="space-y-2 rounded-md border p-4">
                    <h4 className="font-medium">Suggested Topics:</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {topicSuggestions.map((suggestion, index) => (
                            <li key={index} className="cursor-pointer hover:text-primary" onClick={() => {
                                form.setValue('topic', suggestion);
                                setTopicSuggestions([]);
                            }}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             <FormField
              control={form.control}
              name="standard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard / Grade Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="middle-school">Middle School</SelectItem>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                       <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depthLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depth Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select depth level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="introductory">Introductory</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Material'}
            </Button>
          </form>
        </Form>
      </div>
      <div className="lg:col-span-2">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContentViewer 
              content={generatedContent} 
              isLoading={isLoading}
              onGenerateVisual={handleGenerateVisualAid}
            />
          </div>
          <div className="lg:col-span-1">
            <VisualAidsPanel visualAids={visualAids} isLoading={isVisualAidLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
