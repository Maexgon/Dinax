'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a schematic, vector-style image of a fitness exercise.
 *
 * The flow takes the name and instructions of an exercise and uses a text-to-image model to create a visual representation.
 * It includes:
 *  - `generateExerciseImage`: The main function to trigger the image generation flow.
 *  - `GenerateExerciseImageInput`: The input type for the function.
 *  - `GenerateExerciseImageOutput`: The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema
const GenerateExerciseImageInputSchema = z.object({
  name: z.string().describe('The name of the fitness exercise.'),
  instructions: z.string().describe('The technical instructions for performing the exercise.'),
});
export type GenerateExerciseImageInput = z.infer<typeof GenerateExerciseImageInputSchema>;

// Define the output schema
const GenerateExerciseImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated schematic image.'),
});
export type GenerateExerciseImageOutput = z.infer<typeof GenerateExerciseImageOutputSchema>;

// Define the prompt for the image generation model
const generateImagePrompt = `
Generate a fun, minimalist, vector-style schematic image of the following fitness exercise.
The image should be simple, clear, and focus on the movement, like a diagram.
Use a white background. The main colors should be black for outlines and a single accent color like orange or blue for emphasis on the muscles involved.

Exercise Name: {{name}}
Instructions: {{instructions}}
`;

// Define the flow
const generateExerciseImageFlow = ai.defineFlow(
  {
    name: 'generateExerciseImageFlow',
    inputSchema: GenerateExerciseImageInputSchema,
    outputSchema: GenerateExerciseImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: generateImagePrompt.replace('{{name}}', input.name).replace('{{instructions}}', input.instructions),
    });

    if (!media.url) {
        throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl: media.url };
  }
);

/**
 * Generates a schematic image for a given exercise.
 * @param input - The input data containing the exercise name and instructions.
 * @returns A promise that resolves to the data URI of the generated image.
 */
export async function generateExerciseImage(input: GenerateExerciseImageInput): Promise<GenerateExerciseImageOutput> {
  return generateExerciseImageFlow(input);
}
