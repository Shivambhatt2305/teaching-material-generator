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
  standard: z
    .string()
    .describe(
      'The educational standard or grade level (e.g., Middle School, High School, University).'
    ),
  depthLevel: z
    .string()
    .describe(
      'The depth level of the teaching content (e.g., introductory, intermediate, advanced).'
    ),
  language: z.string().describe('The language for the teaching content.'),
});
export type GenerateTeachingContentInput = z.infer<
  typeof GenerateTeachingContentInputSchema
>;

const GenerateTeachingContentOutputSchema = z.object({
  teachingContent: z
    .string()
    .describe('The generated teaching content, formatted in Markdown for a presentation. It should include slides separated by "---SLIDE---", with each slide having a title and bullet points.'),
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
  prompt: `You are an expert curriculum designer creating a presentation. Generate the content for the following:

Subject: {{{subject}}}
Topic: {{{topic}}}
Standard/Grade Level: {{{standard}}}
Depth Level: {{{depthLevel}}}
Language: {{{language}}}

IMPORTANT: You must generate the entire response in the requested language: **{{{language}}}**.

Format the entire output in Markdown. Structure the content as a series of slides.
Use '---SLIDE---' as a separator between each slide.
Each slide should have a title starting with '## '.
Use bullet points (-) for the main content of each slide.
Use bold text (**key term**) for emphasis.
Ensure the content is well-structured and easy for students to understand.
Do not include any text before the first slide or after the last slide.`,
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
