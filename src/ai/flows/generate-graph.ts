'use server';
/**
 * @fileOverview An AI flow for generating graphs.
 *
 * - generateGraph - A function that generates a graph image based on a text description.
 * - GenerateGraphInput - The input type for the generateGraph function.
 * - GenerateGraphOutput - The return type for the generateGraph function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateGraphInputSchema = z.object({
  text: z.string().describe('The text content to create a graph for.'),
});
export type GenerateGraphInput = z.infer<typeof GenerateGraphInputSchema>;

const GenerateGraphOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated graph image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateGraphOutput = z.infer<typeof GenerateGraphOutputSchema>;

export async function generateGraph(input: GenerateGraphInput): Promise<GenerateGraphOutput> {
  return generateGraphFlow(input);
}

const generateGraphFlow = ai.defineFlow(
  {
    name: 'generateGraphFlow',
    inputSchema: GenerateGraphInputSchema,
    outputSchema: GenerateGraphOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a clear and simple graph, chart, or data visualization that visually explains the following concept. The image should be professional, easy to understand, and suitable for a presentation slide. It should not contain much text, focusing on the visual representation of data or a process. Concept: "${input.text}"`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error("Image generation for graph failed.");
    }
    
    return { imageDataUri: media.url };
  }
);
