'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { generateTeachingContent } from '@/ai/flows/generate-teaching-content';
import { generateVisualAid } from '@/ai/flows/generate-visual-aid';
import { generateGraph } from '@/ai/flows/generate-graph';
import { ContentViewer, type Slide } from './content-viewer';
import { Textarea } from '../ui/textarea';

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
            { name: "English", chapters: [
                { name: "Prose and Poetry", topics: ["Understanding a Story", "Identifying Rhyme Schemes", "Literary Devices"] },
                { name: "Grammar", topics: ["Parts of Speech Review", "Direct and Indirect Speech", "Active and Passive Voice"] }
            ]},
            { name: "Mathematics", chapters: [
                { name: "Knowing Our Numbers", topics: ["Large Numbers", "Estimation", "Roman Numerals"] },
                { name: "Integers", topics: ["Representing Integers", "Addition and Subtraction of Integers"] },
                { name: "Basic Geometry", topics: ["Lines and Angles", "Triangles and Quadrilaterals", "Circles"] }
            ]},
            { name: "Science", chapters: [
                { name: "Food: Where Does It Come From?", topics: ["Food Variety", "Plant and Animal Sources", "What Animals Eat"] },
                { name: "Components of Food", topics: ["Carbohydrates, Fats, Proteins", "Vitamins and Minerals", "Balanced Diet"] },
                { name: "Getting to Know Plants", topics: ["Herbs, Shrubs, and Trees", "Parts of a Plant: Root, Stem, Leaf, Flower", "Photosynthesis"] },
            ]},
            { name: "Social Studies", chapters: [
                { name: "History: The Indus Valley Civilization", topics: ["Town Planning", "Seals and Pottery", "Daily Life"] },
                { name: "History: The Vedic Period", topics: ["The Four Vedas", "Early and Later Vedic Society", "Political System"] },
                { name: "Geography: The Earth in the Solar System", topics: ["Planets and Stars", "The Moon", "Asteroids and Meteoroids"] },
                { name: "Civics: Understanding Diversity", topics: ["Diversity in India", "Unity in Diversity", "Prejudice and Discrimination"] },
            ]}
        ]
    },
    {
        grade: "Grade 7",
        subjects: [
            { name: "English", chapters: [
                { name: "Writing Skills", topics: ["Formal and Informal Letters", "Notice Writing", "Report Writing"] },
                { name: "Advanced Grammar", topics: ["Clauses and Phrases", "Conjunctions", "Modals"] }
            ]},
            { name: "Mathematics", chapters: [
                { name: "Fractions and Decimals", topics: ["Multiplication and Division of Fractions", "Operations on Decimals"] },
                { name: "Data Handling", topics: ["Mean, Median, Mode", "Bar Graphs", "Probability"] },
                { name: "Algebraic Expressions", topics: ["Terms of an Expression", "Addition and Subtraction of Expressions", "Finding the Value of an Expression"] }
            ]},
            { name: "Science", chapters: [
                { name: "Nutrition in Plants and Animals", topics: ["Autotrophic and Heterotrophic Nutrition", "Human Digestive System", "Nutrition in Ruminants"] },
                { name: "Acids, Bases, and Salts", topics: ["Indicators", "Neutralization", "Salts"] },
                { name: "Weather, Climate and Adaptations", topics: ["Elements of Weather", "Climate", "Adaptations of Animals to Climate"] },
            ]},
            { name: "Social Studies", chapters: [
                { name: "History: The Delhi Sultanate", topics: ["The Slave Dynasty", "The Khalji and Tughlaq Dynasties", "Administration and Architecture"] },
                { name: "History: The Mughal Empire", topics: ["Babur to Aurangzeb", "Mughal Administration and Art", "Decline of the Empire"] },
                { name: "Geography: Our Environment", topics: ["Components of Environment", "Ecosystem", "Human Environment"] },
                { name: "Civics: Role of the Government in Health", topics: ["Public and Private Healthcare", "Healthcare and Equality", "Case Studies"] },
            ]}
        ]
    },
    {
        grade: "Grade 8",
        subjects: [
            { name: "English", chapters: [
                { name: "Reading Comprehension", topics: ["Inferential Questions", "Summarizing a Passage", "Vocabulary in Context"] },
                { name: "Literary Texts", topics: ["Analyzing Characters", "Understanding Plot and Theme", "Figurative Language"] }
            ]},
            { name: "Mathematics", chapters: [
                { name: "Rational Numbers", topics: ["Properties of Rational Numbers", "Representation on Number Line", "Rational Numbers between two numbers"] },
                { name: "Linear Equations in One Variable", topics: ["Solving Equations", "Applications of Linear Equations"] },
                { name: "Mensuration", topics: ["Area of Trapezium and Polygon", "Surface Area and Volume of Cuboid, Cube, Cylinder"] }
            ]},
            { name: "Science", chapters: [
                { name: "Microorganisms: Friend and Foe", topics: ["Viruses, Bacteria, Fungi", "Useful and Harmful Microorganisms", "Food Preservation"] },
                { name: "Cell - Structure and Functions", topics: ["Discovery of the Cell", "Parts of a Cell", "Plant vs. Animal Cells"] },
                { name: "Force and Pressure", topics: ["Force: A Push or a Pull", "Types of Forces", "Pressure"] },
            ]},
            { name: "Social Studies", chapters: [
                { name: "History: From Trade to Territory", topics: ["The East India Company", "The Battle of Plassey", "The Doctrine of Lapse"] },
                { name: "History: The Great Uprising of 1857", topics: ["Causes of the Revolt", "Main Centers of the Revolt", "Consequences"] },
                { name: "Geography: Resources", topics: ["Types of Resources", "Conservation of Resources", "Sustainable Development"] },
                { name: "Civics: The Indian Constitution", topics: ["Why do we need a Constitution?", "Key Features of the Indian Constitution", "Fundamental Rights and Duties"] },
            ]}
        ]
    },
    {
        grade: "Grade 9",
        subjects: [
            { name: "English", chapters: [
                { name: "Prose Analysis", topics: ["The Fun They Had", "The Sound of Music", "A Truly Beautiful Mind"] },
                { name: "Poetry Analysis", topics: ["The Road Not Taken", "Wind", "No Men Are Foreign"] }
            ]},
            { name: "Mathematics", chapters: [
                { name: "Number Systems", topics: ["Real Numbers and their Decimal Expansions", "Laws of Exponents for Real Numbers"] },
                { name: "Polynomials", topics: ["Remainder Theorem", "Factor Theorem", "Algebraic Identities"] },
                { name: "Coordinate Geometry", topics: ["Cartesian System", "Plotting a Point in the Plane"] }
            ]},
            { name: "Science", chapters: [
                { name: "Physics: Motion", topics: ["Distance and Displacement", "Velocity and Acceleration", "Equations of Motion", "Uniform Circular Motion"] },
                { name: "Chemistry: Matter in Our Surroundings", topics: ["States of Matter", "Interconversion of States", "Evaporation", "Latent Heat"] },
                { name: "Biology: The Fundamental Unit of Life", topics: ["Cell Theory", "Prokaryotic and Eukaryotic Cells", "Cell Organelles", "Cell Division"] },
            ]},
            { name: "Social Science", chapters: [
                { name: "History: The French Revolution", topics: ["Causes", "The Reign of Terror", "Rise of Napoleon Bonaparte"] },
                { name: "Geography: India - Size and Location", topics: ["Location and Size of India", "India and the World", "India's Neighbors"] },
                { name: "Political Science: What is Democracy? Why Democracy?", topics: ["Features of Democracy", "Arguments for and against Democracy", "Broader Meanings of Democracy"] },
                { name: "Economics: The Story of Village Palampur", topics: ["Factors of Production", "Farming in Palampur", "Non-farm activities in Palampur"] },
            ]}
        ]
    },
    {
        grade: "Grade 10",
        subjects: [
            { name: "English", chapters: [
                { name: "Prose", topics: ["A Letter to God", "Nelson Mandela: Long Walk to Freedom", "The Sermon at Benares"] },
                { name: "Poetry", topics: ["Dust of Snow", "Fire and Ice", "The Trees", "Amanda!"] }
            ]},
            { name: "Mathematics", chapters: [
                { name: "Real Numbers", topics: ["Euclid's Division Lemma", "The Fundamental Theorem of Arithmetic", "Revisiting Rational and Irrational Numbers"] },
                { name: "Trigonometry", topics: ["Trigonometric Ratios", "Trigonometric Identities", "Heights and Distances"] },
                { name: "Statistics", topics: ["Mean of Grouped Data", "Mode and Median of Grouped Data", "Ogive"] }
            ]},
            { name: "Science", chapters: [
                { name: "Physics: Light - Reflection and Refraction", topics: ["Reflection by Spherical Mirrors", "Refraction of Light", "Refraction by Spherical Lenses", "Power of a Lens"] },
                { name: "Chemistry: Carbon and its Compounds", topics: ["Covalent Bonding in Carbon", "Versatile Nature of Carbon", "Homologous Series", "Soaps and Detergents"] },
                { name: "Biology: Life Processes", topics: ["Nutrition", "Respiration", "Transportation", "Excretion"] },
            ]},
            { name: "Social Science", chapters: [
                { name: "History: Nationalism in India", topics: ["The Non-Cooperation Movement", "The Civil Disobedience Movement", "The Sense of Collective Belonging"] },
                { name: "Geography: Resources and Development", topics: ["Types of Resources", "Land Resources", "Soil as a Resource"] },
                { name: "Political Science: Power Sharing", topics: ["Case studies of Belgium and Sri Lanka", "Why power sharing is desirable?", "Forms of Power Sharing"] },
                { name: "Economics: Sectors of the Indian Economy", topics: ["Primary, Secondary and Tertiary Sectors", "Organized and Unorganized Sectors", "Public and Private Sectors"] },
            ]}
        ]
    },
    {
        grade: "Grade 11",
        subjects: [
            { name: "English", chapters: [
                { name: "The Portrait of a Lady", topics: ["Character Sketch", "Themes", "Narrative Style"] },
                { name: "A Photograph (Poem)", topics: ["Imagery", "Symbolism", "Poetic Devices"] }
            ]},
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
            ]},
            { name: "Mathematics", chapters: [
                { name: "Sets and Functions", topics: ["Sets", "Relations & Functions", "Trigonometric Functions"] },
                { name: "Algebra", topics: ["Principle of Mathematical Induction", "Complex Numbers and Quadratic Equations", "Binomial Theorem"] },
                { name: "Calculus", topics: ["Limits and Derivatives"] }
            ]},
            { name: "Accountancy", chapters: [
                { name: "Introduction to Accounting", topics: ["Meaning and Objectives of Accounting", "Basic Accounting Terms", "Accounting Principles"] },
                { name: "Recording of Transactions", topics: ["Journal", "Ledger", "Trial Balance"] }
            ]},
            { name: "Business Studies", chapters: [
                { name: "Nature and Purpose of Business", topics: ["Concept and characteristics of business", "Classification of business activities", "Business risk"] },
                { name: "Forms of Business Organisation", topics: ["Sole Proprietorship", "Partnership", "Company"] }
            ]},
            { name: "Economics", chapters: [
                { name: "Statistics for Economics", topics: ["Collection of data", "Organisation of data", "Presentation of data"] },
                { name: "Indian Economic Development", topics: ["Indian Economy on the Eve of Independence", "Economic Reforms since 1991"] }
            ]},
            { name: "History", chapters: [
                { name: "Early Societies", topics: ["From the Beginning of Time", "Writing and City Life (Mesopotamia)"] },
                { name: "Empires", topics: ["An Empire Across Three Continents (Roman Empire)", "The Central Islamic Lands"] }
            ]},
            { name: "Political Science", chapters: [
                { name: "Constitution: Why and How?", topics: ["The making of the Constitution", "The Constituent Assembly", "Philosophy of the Constitution"] },
                { name: "Rights in the Indian Constitution", topics: ["The importance of rights", "Fundamental Rights", "Directive Principles of State Policy"] }
            ]},
        ]
    },
    {
        grade: "Grade 12",
        subjects: [
             { name: "English", chapters: [
                { name: "The Last Lesson", topics: ["Themes of patriotism and linguistic chauvinism", "Character analysis"] },
                { name: "My Mother at Sixty-Six (Poem)", topics: ["Aging and filial duty", "Poetic devices"] }
            ]},
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
            ]},
            { name: "Mathematics", chapters: [
                { name: "Relations and Functions", topics: ["Types of relations and functions", "Inverse Trigonometric Functions"] },
                { name: "Matrices and Determinants", topics: ["Operations on matrices", "Properties of determinants", "Solving system of linear equations"] },
                { name: "Calculus", topics: ["Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Differential Equations"] }
            ]},
            { name: "Accountancy", chapters: [
                { name: "Accounting for Partnership Firms", topics: ["Fundamentals", "Goodwill", "Reconstitution and Dissolution"] },
                { name: "Company Accounts and Financial Statement Analysis", topics: ["Accounting for Share Capital", "Financial Statements of a Company", "Cash Flow Statement"] }
            ]},
            { name: "Business Studies", chapters: [
                { name: "Principles and Functions of Management", topics: ["Nature and Significance of Management", "Planning", "Organising", "Staffing", "Directing", "Controlling"] },
                { name: "Marketing Management", topics: ["Marketing Mix (4 Ps)", "Branding", "Packaging and Labeling"] }
            ]},
            { name: "Economics", chapters: [
                { name: "Introductory Macroeconomics", topics: ["National Income and Related Aggregates", "Money and Banking", "Balance of Payments"] },
                { name: "Indian Economic Development", topics: ["Employment", "Infrastructure", "Sustainable Economic Development"] }
            ]},
            { name: "History", chapters: [
                { name: "Bricks, Beads and Bones (The Harappan Civilisation)", topics: ["Early urban centres", "Craft Production", "Decline of the civilisation"] },
                { name: "Mahatma Gandhi and the Nationalist Movement", topics: ["Civil Disobedience", "Quit India Movement", "Role of Gandhi"] }
            ]},
            { name: "Political Science", chapters: [
                { name: "The Cold War Era", topics: ["Emergence of two power blocs", "Non-Aligned Movement (NAM)"] },
                { name: "Politics in India Since Independence", topics: ["Challenges of Nation Building", "Era of One-Party Dominance", "The Emergency"] }
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
  userPrompt: z.string().min(10, { message: "Please enter a prompt of at least 10 characters." }),
  depthLevel: z.string({ required_error: 'Please select a depth level.' }),
  language: z.string({ required_error: 'Please select a language.' }),
});


export function ContentGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPrompt: "",
      language: 'English',
      depthLevel: 'intermediate',
    },
  });

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
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Topic or Prompt</FormLabel>
                   <FormControl>
                    <Textarea
                      placeholder="e.g., 'An introduction to the solar system for 5th graders' or 'Explain Newton's Laws of Motion with simple examples.'"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the presentation you want to create. Be as specific as you like.
                  </FormDescription>
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
          setSlides={setSlides}
          isLoading={isLoading}
          onGenerateVisual={handleGenerateVisualAid}
          onGenerateGraph={handleGenerateGraph}
        />
      </div>
    </div>
  );
}
