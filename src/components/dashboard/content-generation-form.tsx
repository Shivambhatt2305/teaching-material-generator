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
import { Loader2, Lightbulb } from 'lucide-react';

import { generateTeachingContent } from '@/ai/flows/generate-teaching-content';
import { generateVisualAid } from '@/ai/flows/generate-visual-aid';
import { generateGraph } from '@/ai/flows/generate-graph';
import { suggestTopics } from '@/ai/flows/suggest-topics';
import { ContentViewer, type Slide } from './content-viewer';

const curriculumData = [
    {
        grade: "Grade 1",
        subjects: [
            { name: "English", chapters: [
                { name: "The Alphabet", topics: ["Recognizing Letters (A-Z)", "Vowels and Consonants", "Alphabetical Order"] },
                { name: "Basic Words", topics: ["Three-Letter Words", "Sight Words", "Picture-Word Association"] },
            ]},
            { name: "Mathematics", chapters: [
                { name: "Numbers 1-50", topics: ["Counting Forward and Backward", "Number Names", "Comparing Numbers (More/Less)"] },
                { name: "Simple Addition", topics: ["Adding Single-Digit Numbers", "Addition with Pictures", "Zero in Addition"] },
            ]},
            { name: "Environmental Science", chapters: [
                { name: "My Body", topics: ["Parts of the Body", "Sense Organs", "Keeping Clean"] },
                { name: "Plants Around Us", topics: ["Types of Plants", "Parts of a Plant", "What Plants Need"] },
            ]}
        ]
    },
    {
        grade: "Grade 2",
        subjects: [
            { name: "English", chapters: [
                { name: "Nouns and Verbs", topics: ["Identifying Naming Words (Nouns)", "Identifying Action Words (Verbs)", "Singular and Plural Nouns"] },
                { name: "Sentence Building", topics: ["Making Simple Sentences", "Using Capital Letters and Full Stops", "Answering Simple Questions"] },
            ]},
            { name: "Mathematics", chapters: [
                { name: "Numbers up to 100", topics: ["Place Value (Tens and Ones)", "Expanded Form", "Skip Counting (2s, 5s, 10s)"] },
                { name: "Simple Subtraction", topics: ["Subtracting Single-Digit Numbers", "Subtraction with Pictures", "Zero in Subtraction"] },
            ]},
            { name: "Environmental Science", chapters: [
                { name: "Animals Around Us", topics: ["Wild and Domestic Animals", "Animal Homes and Sounds", "What Animals Eat"] },
                { name: "Water", topics: ["Sources of Water", "Uses of Water", "Saving Water"] },
            ]}
        ]
    },
    {
        grade: "Grade 3",
        subjects: [
            { name: "English", chapters: [
                { name: "Pronouns and Adjectives", topics: ["Using He, She, It, They", "Describing Words (Adjectives)", "Articles (A, An, The)"] },
                { name: "Reading Comprehension", topics: ["Reading a Short Story", "Answering Questions from a Passage", "Finding the Main Idea"] },
            ]},
            { name: "Mathematics", chapters: [
                { name: "Introduction to Multiplication", topics: ["Multiplication as Repeated Addition", "Multiplication Tables (2, 3, 4, 5, 10)", "Simple Multiplication Problems"] },
                { name: "Time and Money", topics: ["Reading a Clock (O'Clock, Half Past)", "Days of the Week, Months of the Year", "Indian Currency (Notes and Coins)"] },
            ]},
            { name: "Science", chapters: [
                { name: "Living and Non-Living Things", topics: ["Characteristics of Living Things", "Natural and Man-Made Things", "Differences between Plants and Animals"] },
                { name: "Our Universe", topics: ["The Sun, Moon, and Stars", "The Earth is a Planet", "Day and Night"] },
            ]},
            { name: "Social Studies", chapters: [
                { name: "My Family and Neighborhood", topics: ["Types of Families", "People in My Neighborhood", "Places in a Neighborhood"] },
                { name: "Festivals We Celebrate", topics: ["National Festivals", "Religious Festivals", "Harvest Festivals"] },
            ]}
        ]
    },
    {
        grade: "Grade 4",
        subjects: [
            { name: "English", chapters: [
                { name: "Tenses", topics: ["Present, Past, and Future Tense", "Simple Continuous Tense", "Correct Usage of Tenses"] },
                { name: "Creative Writing", topics: ["Paragraph Writing", "Picture Composition", "Writing a Short Story"] },
            ]},
            { name: "Mathematics", chapters: [
                { name: "Division", topics: ["Division as Equal Sharing", "Long Division Method (Simple)", "Relationship between Multiplication and Division"] },
                { name: "Fractions", topics: ["Understanding Fractions (Halves, Thirds, Quarters)", "Comparing Fractions", "Equivalent Fractions"] },
            ]},
            { name: "Science", chapters: [
                { name: "Food and Digestion", topics: ["Nutrients in Food", "Balanced Diet", "The Human Digestive System"] },
                { name: "Matter", topics: ["Solids, Liquids, and Gases", "Changes of State (Melting, Freezing, Evaporation)", "Properties of Matter"] },
            ]},
            { name: "Social Studies", chapters: [
                { name: "Our Country - India", topics: ["Location and Neighbors", "States and Union Territories", "Physical Divisions of India"] },
                { name: "Our Government", topics: ["Local Self-Government (Panchayat, Municipality)", "The Central Government", "The State Government"] },
            ]}
        ]
    },
    {
        grade: "Grade 5",
        subjects: [
            { name: "English", chapters: [
                { name: "Types of Sentences", topics: ["Declarative, Interrogative, Imperative, Exclamatory", "Subject and Predicate", "Complex Sentences"] },
                { name: "Vocabulary", topics: ["Synonyms and Antonyms", "Homophones", "Idioms and Phrases"] },
            ]},
            { name: "Mathematics", chapters: [
                { name: "Decimals", topics: ["Understanding Decimals", "Place Value in Decimals", "Addition and Subtraction of Decimals"] },
                { name: "Geometry", topics: ["Angles (Acute, Obtuse, Right)", "Circles (Radius, Diameter, Circumference)", "Area and Perimeter of Squares and Rectangles"] },
            ]},
            { name: "Science", chapters: [
                { name: "The Skeletal System", topics: ["The Human Skeleton", "Joints", "Importance of Bones"] },
                { name: "Force, Work, and Energy", topics: ["Types of Forces (Gravity, Friction)", "Simple Machines", "Forms of Energy"] },
            ]},
            { name: "Social Studies", chapters: [
                { name: "The Freedom Struggle", topics: ["The Revolt of 1857", "Famous Freedom Fighters", "India's Independence"] },
                { name: "The United Nations", topics: ["Formation of the UN", "Organs of the UN", "India's Role in the UN"] },
            ]}
        ]
    },
    {
        grade: "Grade 6",
        subjects: [
            { name: "Science", chapters: [
                { name: "Food: Where Does It Come From?", topics: ["Food Variety", "Plant and Animal Sources", "What Animals Eat"] },
                { name: "Components of Food", topics: ["Carbohydrates, Fats, Proteins", "Vitamins and Minerals", "Balanced Diet"] },
                { name: "Getting to Know Plants", topics: ["Herbs, Shrubs, and Trees", "Parts of a Plant: Root, Stem, Leaf, Flower", "Photosynthesis"] },
            ]},
            { name: "History", chapters: [
                { name: "The Indus Valley Civilization", topics: ["Town Planning", "Seals and Pottery", "Daily Life"] },
                { name: "The Vedic Period", topics: ["The Four Vedas", "Early and Later Vedic Society", "Political System"] },
                { name: "The Mauryan Empire", topics: ["Chandragupta Maurya", "Ashoka and his Dhamma", "Mauryan Administration"] },
            ]},
            { name: "Geography", chapters: [
                { name: "The Earth in the Solar System", topics: ["Planets and Stars", "The Moon", "Asteroids and Meteoroids"] },
                { name: "Motions of the Earth", topics: ["Rotation and Revolution", "Seasons", "Leap Year"] },
            ]}
        ]
    },
    {
        grade: "Grade 7",
        subjects: [
            { name: "Science", chapters: [
                { name: "Nutrition in Plants and Animals", topics: ["Autotrophic and Heterotrophic Nutrition", "Human Digestive System", "Nutrition in Ruminants"] },
                { name: "Acids, Bases, and Salts", topics: ["Indicators", "Neutralization", "Salts"] },
                { name: "Weather, Climate and Adaptations", topics: ["Elements of Weather", "Climate", "Adaptations of Animals to Climate"] },
            ]},
            { name: "History", chapters: [
                { name: "The Delhi Sultanate", topics: ["The Slave Dynasty", "The Khalji and Tughlaq Dynasties", "Administration and Architecture"] },
                { name: "The Mughal Empire", topics: ["Babur to Aurangzeb", "Mughal Administration and Art", "Decline of the Empire"] },
            ]},
            { name: "Geography", chapters: [
                { name: "Our Environment", topics: ["Components of Environment", "Ecosystem", "Human Environment"] },
                { name: "Inside Our Earth", topics: ["Layers of the Earth", "Rocks and Minerals", "The Rock Cycle"] },
            ]}
        ]
    },
    {
        grade: "Grade 8",
        subjects: [
            { name: "Science", chapters: [
                { name: "Microorganisms: Friend and Foe", topics: ["Viruses, Bacteria, Fungi", "Useful and Harmful Microorganisms", "Food Preservation"] },
                { name: "Cell - Structure and Functions", topics: ["Discovery of the Cell", "Parts of a Cell", "Plant vs. Animal Cells"] },
                { name: "Force and Pressure", topics: ["Force: A Push or a Pull", "Types of Forces", "Pressure"] },
            ]},
            { name: "History", chapters: [
                { name: "From Trade to Territory", topics: ["The East India Company", "The Battle of Plassey", "The Doctrine of Lapse"] },
                { name: "The Great Uprising of 1857", topics: ["Causes of the Revolt", "Main Centers of the Revolt", "Consequences"] },
                { name: "India After Independence", topics: ["Partition", "Integration of Princely States", "The Making of the Constitution"] },
            ]},
            { name: "Civics", chapters: [
                { name: "The Indian Constitution", topics: ["Why do we need a Constitution?", "Key Features of the Indian Constitution", "Fundamental Rights and Duties"] },
                { name: "Understanding Secularism", topics: ["What is Secularism?", "The Indian Model of Secularism", "Importance of Secularism"] },
            ]}
        ]
    },
    {
        grade: "Grade 9",
        subjects: [
            { name: "Physics", chapters: [
                { name: "Motion", topics: ["Distance and Displacement", "Velocity and Acceleration", "Equations of Motion", "Uniform Circular Motion"] },
                { name: "Force and Laws of Motion", topics: ["Newton's First Law", "Newton's Second Law (F=ma)", "Newton's Third Law", "Conservation of Momentum"] },
                { name: "Work and Energy", topics: ["Work Done by a Force", "Kinetic and Potential Energy", "Law of Conservation of Energy", "Power"] },
            ]},
            { name: "Chemistry", chapters: [
                { name: "Matter in Our Surroundings", topics: ["States of Matter", "Interconversion of States", "Evaporation", "Latent Heat"] },
                { name: "Is Matter Around Us Pure?", topics: ["Mixtures and Solutions", "Separating Components of a Mixture", "Physical and Chemical Changes"] },
            ]},
            { name: "Biology", chapters: [
                { name: "The Fundamental Unit of Life", topics: ["Cell Theory", "Prokaryotic and Eukaryotic Cells", "Cell Organelles", "Cell Division"] },
                { name: "Tissues", topics: ["Plant Tissues (Meristematic, Permanent)", "Animal Tissues (Epithelial, Connective, Muscular, Nervous)"] },
            ]},
            { name: "History", chapters: [
                { name: "The French Revolution", topics: ["Causes", "The Reign of Terror", "Rise of Napoleon Bonaparte"] },
                { name: "Socialism in Europe and the Russian Revolution", topics: ["The 1905 Revolution", "The October Revolution of 1917", "Stalinism"] },
            ]}
        ]
    },
    {
        grade: "Grade 10",
        subjects: [
            { name: "Physics", chapters: [
                { name: "Light - Reflection and Refraction", topics: ["Reflection by Spherical Mirrors", "Refraction of Light", "Refraction by Spherical Lenses", "Power of a Lens"] },
                { name: "Electricity", topics: ["Ohm's Law", "Resistors in Series and Parallel", "Heating Effect of Electric Current", "Electric Power"] },
                { name: "Magnetic Effects of Electric Current", topics: ["Magnetic Field and Field Lines", "Electromagnetic Induction", "Electric Motor", "Electric Generator"] },
            ]},
            { name: "Chemistry", chapters: [
                { name: "Chemical Reactions and Equations", topics: ["Balancing Chemical Equations", "Types of Chemical Reactions", "Corrosion and Rancidity"] },
                { name: "Acids, Bases and Salts", topics: ["pH Scale", "Important Acids, Bases, and Salts", "Making of Plaster of Paris"] },
                { name:_("Carbon and its Compounds"), topics: ["Covalent Bonding in Carbon", "Versatile Nature of Carbon", "Homologous Series", "Soaps and Detergents"] },
            ]},
            { name: "Biology", chapters: [
                { name: "Life Processes", topics: ["Nutrition", "Respiration", "Transportation", "Excretion"] },
                { name: "How do Organisms Reproduce?", topics: ["Asexual and Sexual Reproduction", "Reproduction in Human Beings", "Reproductive Health"] },
                { name: "Heredity and Evolution", topics: ["Mendel's Contributions", "How are Traits Expressed", "Speciation"] },
            ]},
             { name: "History", chapters: [
                { name: "Nationalism in India", topics: ["The Non-Cooperation Movement", "The Civil Disobedience Movement", "The Quit India Movement"] },
                { name: "The Making of a Global World", topics: ["The Silk Routes", "The Great Depression", "Post-War Era"] },
            ]}
        ]
    },
    {
        grade: "Grade 11",
        subjects: [
            { name: "Physics", chapters: [
                { name: "Kinematics", topics: ["Vectors", "Projectile Motion", "Relative Velocity"] },
                { name: "Laws of Motion", topics: ["Newton's Laws", "Friction", "Circular Motion"] },
                { name: "Thermodynamics", topics: ["Zeroth, First, and Second Laws", "Heat Engines", "Refrigerators"] },
            ]},
            { name: "Chemistry", chapters: [
                { name: "Atomic Structure", topics: ["Quantum Numbers", "Aufbau Principle", "Heisenberg's Uncertainty Principle"] },
                { name: "Chemical Bonding", topics: ["VSEPR Theory", "Valence Bond Theory", "Molecular Orbital Theory"] },
                { name: "Equilibrium", topics: ["Chemical Equilibrium", "Ionic Equilibrium", "Le Chatelier's Principle"] },
            ]},
            { name: "Biology", chapters: [
                { name: "The Living World", topics: ["Taxonomy and Systematics", "Five Kingdom Classification"] },
                { name: "Cell: The Unit of Life", topics: ["Detailed Cell Structure", "The Cell Cycle", "Meiosis and Mitosis"] },
                { name: "Human Physiology", topics: ["Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation"] },
            ]}
        ]
    },
    {
        grade: "Grade 12",
        subjects: [
            { name: "Physics", chapters: [
                { name: "Electrostatics", topics: ["Electric Charges and Fields", "Gauss's Law", "Capacitance"] },
                { name: "Current Electricity", topics: ["Kirchhoff's Laws", "Potentiometer", "Wheatstone Bridge"] },
                { name: "Optics", topics: ["Huygens Principle", "Interference", "Diffraction", "Polarisation"] },
            ]},
            { name: "Chemistry", chapters: [
                { name: "Solutions", topics: ["Colligative Properties", "Raoult's Law", "van't Hoff Factor"] },
                { name: "Electrochemistry", topics: ["Nernst Equation", "Electrolytic Cells", "Batteries and Corrosion"] },
                { name: "d and f Block Elements", topics: ["General Properties", "Lanthanoid Contraction", "Potassium Permanganate"] },
            ]},
            { name: "Biology", chapters: [
                { name: "Reproduction", topics: ["Reproduction in Organisms", "Human Reproduction", "Reproductive Health"] },
                { name: "Genetics and Evolution", topics: ["Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution"] },
                { name: "Biotechnology", topics: ["Principles and Processes", "Applications of Biotechnology", "Genetically Modified Organisms"] },
            ]}
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
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<CurriculumItem[]>([]);
  const [chapters, setChapters] = useState<CurriculumItem[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

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
    setAvailableTopics([]);
  }, [grade, form]);

  useEffect(() => {
    form.resetField("chapter");
    form.resetField("topics", { defaultValue: [] });
    const selectedSubject = subjects.find(s => s.name === subject);
    setChapters(selectedSubject?.chapters || []);
    setAvailableTopics([]);
  }, [subject, subjects, form]);

  useEffect(() => {
    form.resetField("topics", { defaultValue: [] });
    const selectedChapter = chapters.find(c => c.name === chapter);
    setAvailableTopics(selectedChapter?.topics || []);
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

  const handleTopicSuggest = async () => {
    if (!subject || !chapter) return;
    setIsSuggesting(true);
    try {
      const result = await suggestTopics({ subject, mainTopic: chapter });
      const newTopics = result.suggestedTopics.filter(t => !availableTopics.includes(t));
      setAvailableTopics(prev => [...prev, ...newTopics]);
      toast({
          title: 'New topics suggested!',
          description: 'We\'ve added a few more topic ideas to the list for you.',
      });
    } catch (error) {
        console.error("Failed to suggest topics", error);
        toast({
            variant: 'destructive',
            title: 'Failed to suggest topics.',
            description: 'There was a problem with the AI model. Please try again.',
        });
    } finally {
        setIsSuggesting(false);
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
            {availableTopics.length > 0 && (
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
                    <div className="space-y-3">
                      {availableTopics.map((item) => (
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
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage className="pt-2" />
                    <div className="mt-4">
                        <Button type="button" variant="outline" size="sm" onClick={handleTopicSuggest} disabled={isSuggesting || !chapter}>
                            {isSuggesting ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                            Suggest More Topics
                        </Button>
                    </div>
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

    