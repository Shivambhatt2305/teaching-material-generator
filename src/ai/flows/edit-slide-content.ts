'use server';

/**
 * @fileOverview An AI flow for editing slide content based on user instructions.
 *
 * - editSlideContent - A function that revises slide content.
 * - EditSlideContentInput - The input type for the editSlideContent function.
 * - EditSlideContentOutput - The return type for the editSlideContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const EditSlideContentInputSchema = z.object({
  originalContent: z.string().describe("The original Markdown content of the slide."),
  editPrompt: z.string().describe("The user's instructions for how to edit the content."),
  language: z.string().describe('The language for the output content.'),
});
export type EditSlideContentInput = z.infer<typeof EditSlideContentInputSchema>;

const EditSlideContentOutputSchema = z.object({
  editedContent: z.string().describe("The revised Markdown content for the slide."),
});
export type EditSlideContentOutput = z.infer<typeof EditSlideContentOutputSchema>;

export async function editSlideContent(
  input: EditSlideContentInput
): Promise<EditSlideContentOutput> {
  return editSlideContentFlow(input);
}

const editSlideContentPrompt = ai.definePrompt({
  name: 'editSlideContentPrompt',
  input: {schema: EditSlideContentInputSchema},
  output: {schema: EditSlideContentOutputSchema},
  prompt: `You are an expert instructional designer revising a presentation slide. Your entire output MUST be in the language '{{{language}}}'.

A user wants to modify a slide. Revise the original content based on their instructions. Maintain the original Markdown format (e.g., '## Title', '- Bullet point'). Only output the revised content for the slide.

**Original Slide Content:**
---
{{{originalContent}}}
---

**User's Edit Instructions:**
---
{{{editPrompt}}}
---

Now, provide the completely revised slide content in Markdown format.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const editSlideContentFlow = ai.defineFlow(
  {
    name: 'editSlideContentFlow',
    inputSchema: EditSlideContentInputSchema,
    outputSchema: EditSlideContentOutputSchema,
  },
  async input => {
    const {output} = await editSlideContentPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid response for the edit.');
    }
    return output;
  }
);
