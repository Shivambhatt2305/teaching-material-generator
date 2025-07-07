'use server';

/**
 * @fileOverview AI flow for generating teaching content based on subject, topic, and depth level.
 *
 * - generateTeachingContent - A function that generates teaching content.
 * - GenerateTeachingContentInput - The input type for the generateTeachingContent function.
 * - GenerateTeachingContentOutput - The return type for the generateTeachingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeachingContentInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate teaching content.'),
  topic: z.string().describe('The specific topic within the subject.'),
  standard: z.string().describe('The educational standard or grade level (e.g., Middle School, High School, University).'),
  depthLevel: z
    .string()
    .describe(
      'The depth level of the teaching content (e.g., introductory, intermediate, advanced).'
    ),
});
export type GenerateTeachingContentInput = z.infer<
  typeof GenerateTeachingContentInputSchema
>;

const GenerateTeachingContentOutputSchema = z.object({
  teachingContent: z
    .string()
    .describe('The generated teaching content, formatted in Markdown. It should include headings, lists, and bold text for key points.'),
});
export type GenerateTeachingContentOutput = z.infer<
  typeof GenerateTeachingContentOutputSchema
>;

export async function generateTeachingContent(
  input: GenerateTeachingContentInput
): Promise<GenerateTeachingContentOutput> {
  return generateTeachingContentFlow(input);
}

const generateTeachingContentPrompt = ai.definePrompt({
  name: 'generateTeachingContentPrompt',
  input: {schema: GenerateTeachingContentInputSchema},
  output: {schema: GenerateTeachingContentOutputSchema},
  prompt: `You are an experienced teacher. Generate teaching content for the following subject, topic, standard, and depth level:

Subject: {{{subject}}}
Topic: {{{topic}}}
Standard/Grade Level: {{{standard}}}
Depth Level: {{{depthLevel}}}

The teaching content should include explanations, examples, and key points. 
Format the entire output in Markdown. Use headings (## for main sections, ### for subsections), bullet points (-), and bold text (**key term**) for emphasis. 
Ensure the content is well-structured and easy for students to understand. Do not include any text before or after the markdown content.`,
});

const generateTeachingContentFlow = ai.defineFlow(
  {
    name: 'generateTeachingContentFlow',
    inputSchema: GenerateTeachingContentInputSchema,
    outputSchema: GenerateTeachingContentOutputSchema,
  },
  async input => {
    const {output} = await generateTeachingContentPrompt(input);
    return output!;
  }
);
