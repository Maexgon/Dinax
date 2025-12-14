'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting personalized and realistic fitness goals.
 *
 * The flow uses the student's profile and past performance data to recommend tailored training plans.
 * It includes:
 *  - `suggestGoals`: The main function to trigger the goal suggestion flow.
 *  - `SuggestGoalsInput`: The input type for the suggestGoals function.
 *  - `SuggestGoalsOutput`: The return type for the suggestGoals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestGoalsInputSchema = z.object({
  studentProfile: z.object({
    age: z.number().describe('The age of the student.'),
    gender: z.string().describe('The gender of the student.'),
    weight: z.number().describe('The weight of the student in kilograms.'),
    height: z.number().describe('The height of the student in centimeters.'),
    medicalConditions: z.string().describe('Any medical conditions the student has.'),
    biomechanicalData: z.string().describe('Biomechanical data of the student.'),
  }).describe('The student profile data.'),
  pastPerformanceData: z.string().describe('Past performance data of the student.'),
});
export type SuggestGoalsInput = z.infer<typeof SuggestGoalsInputSchema>;

// Define the output schema
const SuggestGoalsOutputSchema = z.object({
  suggestedGoals: z.string().describe('Suggested realistic fitness goals for the student.'),
  trainingIntensity: z.string().describe('Recommended training intensity.'),
});
export type SuggestGoalsOutput = z.infer<typeof SuggestGoalsOutputSchema>;

// Define the prompt
const suggestGoalsPrompt = ai.definePrompt({
  name: 'suggestGoalsPrompt',
  input: {schema: SuggestGoalsInputSchema},
  output: {schema: SuggestGoalsOutputSchema},
  prompt: `You are an AI fitness assistant. You will suggest personalized and realistic fitness goals for the student based on their profile and past performance data.

Student Profile: {{{studentProfile}}}
Past Performance Data: {{{pastPerformanceData}}}

Based on the student's profile and past performance data, suggest realistic fitness goals and a recommended training intensity.
`,
});

// Define the flow
const suggestGoalsFlow = ai.defineFlow(
  {
    name: 'suggestGoalsFlow',
    inputSchema: SuggestGoalsInputSchema,
    outputSchema: SuggestGoalsOutputSchema,
  },
  async input => {
    const {output} = await suggestGoalsPrompt(input);
    return output!;
  }
);

/**
 * Suggests personalized fitness goals based on student data.
 * @param input - The input data containing student profile and past performance.
 * @returns A promise that resolves to the suggested goals and training intensity.
 */
export async function suggestGoals(input: SuggestGoalsInput): Promise<SuggestGoalsOutput> {
  return suggestGoalsFlow(input);
}
