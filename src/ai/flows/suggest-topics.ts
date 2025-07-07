'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting related subtopics based on a given subject and main topic.
 *
 * - suggestTopics - A function that takes a subject and main topic as input and returns a list of suggested subtopics.
 * - SuggestTopicsInput - The input type for the suggestTopics function.
 * - SuggestTopicsOutput - The return type for the suggestTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTopicsInputSchema = z.object({
  subject: z.string().describe('The subject for which subtopics are needed.'),
  mainTopic: z.string().describe('The main topic for which subtopics are needed.'),
});
export type SuggestTopicsInput = z.infer<typeof SuggestTopicsInputSchema>;

const SuggestTopicsOutputSchema = z.object({
  suggestedTopics: z.array(z.string()).describe('A list of suggested subtopics related to the main topic.'),
});
export type SuggestTopicsOutput = z.infer<typeof SuggestTopicsOutputSchema>;

export async function suggestTopics(input: SuggestTopicsInput): Promise<SuggestTopicsOutput> {
  return suggestTopicsFlow(input);
}

const suggestTopicsPrompt = ai.definePrompt({
  name: 'suggestTopicsPrompt',
  input: {schema: SuggestTopicsInputSchema},
  output: {schema: SuggestTopicsOutputSchema},
  prompt: `You are a helpful AI curriculum designer. Your task is to suggest related subtopics for a given subject and main topic (chapter).

  Subject: {{{subject}}}
  Main Topic: {{{mainTopic}}}

  Based on the subject and main topic, suggest a list of 4-5 additional, relevant subtopics that a teacher might want to cover. Return the list as a simple JSON array of strings.
  Do not add any additional text to your response other than the JSON object.`,
});

const suggestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestTopicsFlow',
    inputSchema: SuggestTopicsInputSchema,
    outputSchema: SuggestTopicsOutputSchema,
  },
  async input => {
    const {output} = await suggestTopicsPrompt(input);
    return output!;
  }
);
