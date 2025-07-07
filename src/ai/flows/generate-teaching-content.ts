'use server';

/**
 * @fileOverview AI flow for generating teaching content based on subject, topic, and depth level.
 *
 * - generateTeachingContent - A function that generates teaching content.
 * - GenerateTeachingContentInput - The input type for the generateTeachingContent function.
 * - GenerateTeachingContentOutput - The return type for the generateTeachingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTeachingContentInputSchema = z.object({
  grade: z.string().describe("The grade level for the content (e.g., 'Middle School (Grades 7-9)')"),
  subject: z.string().describe('The subject for which to generate teaching content.'),
  chapter: z.string().describe('The specific chapter within the subject.'),
  topics: z.array(z.string()).describe('A list of topics to be covered in the presentation.'),
  customTopic: z.string().optional().describe('An additional custom topic specified by the user.'),
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

const SlideSchema = z.object({
  content: z.string().describe("The Markdown content for a single slide, including a title and bullet points."),
  visualAidSuggestion: z.string().describe("A concise, 5-10 word prompt for an AI image generator to create a relevant visual aid for this slide's content."),
});

const GenerateTeachingContentOutputSchema = z.object({
  slides: z.array(SlideSchema).describe("An array of presentation slides."),
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
  prompt: `You are an expert curriculum designer creating a presentation in the language '{{{language}}}'.

Generate the content for the following:
Grade Level: {{{grade}}}
Subject: {{{subject}}}
Chapter: {{{chapter}}}
Depth Level: {{{depthLevel}}}

Your task is to create a series of presentation slides covering the following topics:
{{#each topics}}
- {{{this}}}
{{/each}}
{{#if customTopic}}
- {{{customTopic}}}
{{/if}}

IMPORTANT: You must generate the entire response in the requested language: **{{{language}}}**.

For each slide, provide two things:
1.  The slide's content, formatted in Markdown. Each slide must have a title starting with '## ' and bullet points (-) for the main content. Use bold text (**key term**) for emphasis.
2.  A concise, 5-10 word suggestion for a visual aid that would accompany the slide. This suggestion will be used as a prompt for an AI image generator. The suggestion must also be in the requested language: **{{{language}}}**.

Structure your entire response as a JSON object that matches the output schema. Do not include any text before or after the JSON.`,
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
