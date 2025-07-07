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
  prompt: `You are an expert instructional designer tasked with creating engaging and accurate teaching materials. Your output must be in the language '{{{language}}}'.

Please generate a presentation based on these precise parameters:
- Grade Level: {{{grade}}}
- Subject: {{{subject}}}
- Chapter: {{{chapter}}}
- Content Depth: {{{depthLevel}}}

The presentation must cover the following specific topics. Do not introduce topics not on this list:
{{#each topics}}
- {{{this}}}
{{/each}}
{{#if customTopic}}
- {{{customTopic}}}
{{/if}}

Adhere strictly to the following formatting guidelines for each slide:
1.  **Content:** Use clear, concise Markdown. Every slide must start with a title (e.g., '## Title'). Use bullet points (-) for key information. Emphasize important terms using bold formatting (e.g., **Key Term**). The tone and complexity must be appropriate for the specified grade level.
2.  **Visual Aid Suggestion:** For each slide, provide a highly relevant, 5-10 word prompt for an AI image generator. This prompt must describe an educational diagram, simple illustration, or chart that visually explains the slide's core concept. The suggestion must also be in '{{{language}}}'.

Your entire response MUST be a single, valid JSON object that conforms to the output schema. Do not include any explanatory text, markdown formatting ticks, or anything else outside of the JSON structure.`,
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
