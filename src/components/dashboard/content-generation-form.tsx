'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { generateTeachingContent } from '@/ai/flows/generate-teaching-content';
import { generateVisualAid } from '@/ai/flows/generate-visual-aid';
import { generateGraph } from '@/ai/flows/generate-graph';
import { ContentViewer, type Slide } from './content-viewer';

const curriculumData = [
    {
        grade: "Elementary School (Grades 1-3)",
        subjects: [
            {
                name: "Math",
                chapters: [
                    { name: "Basic Counting", topics: ["Counting to 20", "Counting by Tens", "Number Recognition"] },
                    { name: "Simple Addition", topics: ["Adding numbers up to 10", "Addition Word Problems", "Making 10"] },
                ]
            },
            {
                name: "Science",
                chapters: [
                    { name: "Living Things", topics: ["Plants and Animals", "What Living Things Need", "Habitats"] },
                    { name: "Weather", topics: ["Sunny, Rainy, Windy", "The Four Seasons", "Observing Weather"] },
                ]
            }
        ]
    },
    {
        grade: "Elementary School (Grades 4-6)",
        subjects: [
            {
                name: "Math",
                chapters: [
                    { name: "Multiplication and Division", topics: ["Multiplication Facts", "Long Division", "Word Problems"] },
                    { name: "Fractions", topics: ["What is a Fraction?", "Equivalent Fractions", "Adding and Subtracting Fractions"] },
                ]
            },
            {
                name: "Science",
                chapters: [
                    { name: "The Solar System", topics: ["The Sun and Planets", "The Moon Phases", "Earth's Rotation"] },
                    { name: "Simple Machines", topics: ["Levers and Pulleys", "Wheels and Axles", "Inclined Planes"] },
                ]
            },
            {
                name: "Social Studies",
                chapters: [
                    { name: "Local Government", topics: ["Mayor and City Council", "Community Services", "How Laws are Made"] },
                    { name: "Map Skills", topics: ["Using a Compass Rose", "Reading a Map Key", "Latitude and Longitude"] },
                ]
            }
        ]
    },
    {
        grade: "Middle School (Grades 7-9)",
        subjects: [
            {
                name: "Science",
                chapters: [
                    { name: "Cells", topics: ["Introduction to Cells", "Plant vs. Animal Cells", "The Microscope", "Cell Organelles"] },
                    { name: "Ecosystems", topics: ["What is an Ecosystem?", "Food Chains and Webs", "Producers, Consumers, Decomposers", "Biotic and Abiotic Factors"] },
                    { name: "Chemistry Basics", topics: ["Atoms and Molecules", "The Periodic Table", "Chemical Reactions"] },
                ]
            },
            {
                name: "History",
                chapters: [
                    { name: "Ancient Rome", topics: ["The Founding of Rome", "The Roman Republic", "The Roman Empire", "Fall of Rome"] },
                    { name: "The Middle Ages", topics: ["Feudalism", "The Crusades", "The Black Death"] },
                ]
            },
            {
                name: "English",
                chapters: [
                    { name: "Grammar", topics: ["Parts of Speech", "Sentence Structure", "Punctuation"] },
                    { name: "Literature", topics: ["Analyzing a Novel", "Poetry and Figurative Language", "Writing a Book Report"] },
                ]
            }
        ]
    },
    {
        grade: "High School (Grades 10-12)",
        subjects: [
            {
                name: "Biology",
                chapters: [
                    { name: "Photosynthesis", topics: ["Light-Dependent Reactions", "The Calvin Cycle", "Factors Affecting Photosynthesis", "Chloroplast Structure"] },
                    { name: "Genetics", topics: ["Mendelian Genetics", "DNA Structure and Replication", "Gene Expression", "Mutations"] },
                    { name: "Evolution", topics: ["Natural Selection", "Evidence for Evolution", "Speciation"] },
                ]
            },
            {
                name: "Chemistry",
                chapters: [
                    { name: "Atomic Structure", topics: ["Protons, Neutrons, Electrons", "Isotopes and Ions", "Electron Configurations", "The Periodic Table"] },
                    { name: "Stoichiometry", topics: ["The Mole Concept", "Balancing Equations", "Limiting Reactants"] },
                ]
            },
            {
                name: "Physics",
                chapters: [
                    { name: "Kinematics", topics: ["Velocity and Acceleration", "Projectile Motion", "Newton's Laws of Motion"] },
                    { name: "Electricity", topics: ["Ohm's Law", "Series and Parallel Circuits", "Magnetism"] },
                ]
            },
            {
                name: "World History",
                chapters: [
                    { name: "World War I", topics: ["Causes of WWI", "Major Battles", "The Treaty of Versailles"] },
                    { name: "The Cold War", topics: ["The Iron Curtain", "The Space Race", "The Fall of the Soviet Union"] },
                ]
            }
        ]
    },
    {
        grade: "University",
        subjects: [
            {
                name: "Computer Science",
                chapters: [
                    { name: "Algorithms and Data Structures", topics: ["Big O Notation", "Sorting Algorithms", "Hash Tables", "Trees and Graphs"] },
                    { name: "Operating Systems", topics: ["Process Management", "Memory Management", "File Systems"] },
                ]
            },
            {
                name: "Economics",
                chapters: [
                    { name: "Microeconomics", topics: ["Supply and Demand", "Market Structures", "Consumer Theory", "Game Theory"] },
                    { name: "Macroeconomics", topics: ["GDP and Economic Growth", "Inflation and Unemployment", "Monetary and Fiscal Policy"] },
                ]
            }
        ]
    }
];

const formSchema = z.object({
  grade: z.string({ required_error: 'Please select a grade level.' }),
  subject: z.string({ required_error: 'Please select a subject.' }),
  chapter: z.string({ required_error: 'Please select a chapter.' }),
  topics: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one topic.',
  }),
  addCustomTopic: z.boolean().default(false),
  customTopic: z.string().optional(),
  depthLevel: z.string({ required_error: 'Please select a depth level.' }),
  language: z.string({ required_error: 'Please select a language.' }),
}).refine(data => {
    if (data.addCustomTopic && !data.customTopic) {
        return false;
    }
    return true;
}, {
    message: "Please enter your custom topic.",
    path: ["customTopic"],
});

type CurriculumItem = { name: string; chapters?: any[]; topics?: string[] };

export function ContentGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<CurriculumItem[]>([]);
  const [chapters, setChapters] = useState<CurriculumItem[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topics: [],
      addCustomTopic: false,
      customTopic: "",
      language: 'English',
      depthLevel: 'intermediate',
    },
  });

  const grade = form.watch("grade");
  const subject = form.watch("subject");
  const chapter = form.watch("chapter");
  const addCustomTopic = form.watch("addCustomTopic");

  useEffect(() => {
    form.resetField("subject");
    form.resetField("chapter");
    form.resetField("topics", { defaultValue: [] });
    const selectedGrade = curriculumData.find(g => g.grade === grade);
    setSubjects(selectedGrade?.subjects || []);
    setChapters([]);
    setTopics([]);
  }, [grade, form]);

  useEffect(() => {
    form.resetField("chapter");
    form.resetField("topics", { defaultValue: [] });
    const selectedSubject = subjects.find(s => s.name === subject);
    setChapters(selectedSubject?.chapters || []);
    setTopics([]);
  }, [subject, subjects, form]);

  useEffect(() => {
    form.resetField("topics", { defaultValue: [] });
    const selectedChapter = chapters.find(c => c.name === chapter);
    setTopics(selectedChapter?.topics || []);
  }, [chapter, chapters, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSlides([]);
    try {
      const result = await generateTeachingContent(values);
      const newSlides: Slide[] = result.slides
        .map((slide, index) => ({
          id: index,
          content: slide.content.trim(),
          visualAidSuggestion: slide.visualAidSuggestion,
          visuals: [],
        }))
        .filter(slide => slide.content);
      setSlides(newSlides);
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

  const handleGenerateVisualAid = async (text: string, slideIndex: number) => {
    try {
      const result = await generateVisualAid({ text });
      setSlides(prev => 
        prev.map((slide, index) => 
          index === slideIndex 
            ? { ...slide, visuals: [...slide.visuals, result.imageDataUri] } 
            : slide
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to generate visual.',
        description: 'There was a problem with the image generation model. Please try again.',
      });
    }
  };
  
  const handleGenerateGraph = async (text: string, slideIndex: number) => {
    try {
      const result = await generateGraph({ text });
       setSlides(prev => 
        prev.map((slide, index) => 
          index === slideIndex 
            ? { ...slide, visuals: [...slide.visuals, result.imageDataUri] } 
            : slide
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to generate graph.',
        description: 'There was a problem with the image generation model. Please try again.',
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {curriculumData.map(item => (
                         <SelectItem key={item.grade} value={item.grade}>{item.grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {subjects.length > 0 && (
                <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value ?? ''}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select subject..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {subjects.map(item => (
                            <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            {chapters.length > 0 && (
                <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Chapter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value ?? ''}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select chapter..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {chapters.map(item => (
                            <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            {topics.length > 0 && (
                <FormField
                    control={form.control}
                    name="topics"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Topics to Cover</FormLabel>
                            <FormDescription>
                                Select the topics you want to include in the presentation.
                            </FormDescription>
                        </div>
                        {topics.map((item) => (
                            <FormField
                            key={item}
                            control={form.control}
                            name="topics"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {item}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            <FormField
              control={form.control}
              name="addCustomTopic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Add a Custom Topic?</FormLabel>
                    <FormDescription>
                      Include an additional topic not in the list.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {addCustomTopic && (
                <FormField
                    control={form.control}
                    name="customTopic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Custom Topic</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., The Role of AI in Genetics" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

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
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi (हिन्दी)</SelectItem>
                      <SelectItem value="Bengali">Bengali (বাংলা)</SelectItem>
                      <SelectItem value="Telugu">Telugu (తెలుగు)</SelectItem>
                      <SelectItem value="Marathi">Marathi (मराठी)</SelectItem>
                      <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                      <SelectItem value="Urdu">Urdu (اردو)</SelectItem>
                      <SelectItem value="Gujarati">Gujarati (ગુજરાતી)</SelectItem>
                      <SelectItem value="Kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                      <SelectItem value="Odia">Odia (ଓଡ଼ିଆ)</SelectItem>
                      <SelectItem value="Malayalam">Malayalam (മലയാളം)</SelectItem>
                      <SelectItem value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
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
        <ContentViewer 
          slides={slides} 
          isLoading={isLoading}
          onGenerateVisual={handleGenerateVisualAid}
          onGenerateGraph={handleGenerateGraph}
        />
      </div>
    </div>
  );
}
