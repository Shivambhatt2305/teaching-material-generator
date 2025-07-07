'use server';
/**
 * @fileOverview An AI flow for generating visual aids.
 *
 * - generateVisualAid - A function that generates an image based on a text description.
 * - GenerateVisualAidInput - The input type for the generateVisualAid function.
 * - GenerateVisualAidOutput - The return type for the generateVisualAid function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVisualAidInputSchema = z.object({
  text: z.string().describe('The text content to create a visual aid for.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image for the visual aid, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(input: GenerateVisualAidInput): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a clear, simple, educational visual aid, diagram, or illustration for the following concept. The image should be visually appealing and suitable for a presentation slide. Avoid using too much text in the image itself. The style should be clean and professional. Concept: "${input.text}"`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error("Image generation failed.");
    }
    
    return { imageDataUri: media.url };
  }
);
