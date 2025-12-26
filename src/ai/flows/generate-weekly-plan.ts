
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a daily training plan.
 * 
 * The flow acts as an expert personal trainer, creating a structured workout
 * for a single day based on a library of available exercises and a specified focus.
 * It includes:
 *  - `generateDayPlan`: The main function to trigger the day plan generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Input Schemas ---
const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Cardio", "Fuerza", "Pylo", "Movilidad", "Core", "cardio", "fuerza", "pylo", "movilidad", "core", "strength", "plyo", "mobility"]).optional(),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.string().optional(),
  imageUrl: z.string().optional(),
});

const GenerateDayPlanInputSchema = z.object({
  exercises: z.array(ExerciseSchema).describe("The library of available exercises to choose from."),
  dayFocus: z.string().describe("The specific focus for this day's workout (e.g., 'Legs', 'Push', 'Pull')."),
  objective: z.string().describe("The main goal of the overall training plan, e.g., 'Hypertrophy', 'Fat Loss'.")
});
export type GenerateDayPlanInput = z.infer<typeof GenerateDayPlanInputSchema>;


// --- Output Schemas ---
const PlannedExerciseSchema = z.object({
  id: z.string().describe("The ID of the exercise from the provided library."),
  name: z.string().describe("The name of the exercise."),
  sets: z.string().describe("The number of sets, e.g., '3-4' or '3'."),
  reps: z.string().describe("The repetition range, e.g., '8-12' or '15'."),
  rpe: z.string().describe("The Rate of Perceived Exertion on a scale of 1-10."),
  rest: z.string().describe("The rest time in seconds, e.g., '90'."),
  duration: z.string().describe("The estimated duration for the exercise in minutes, e.g., '10'."),
});

const GenerateDayPlanOutputSchema = z.object({
    exercises: z.array(PlannedExerciseSchema)
});
export type GenerateDayPlanOutput = z.infer<typeof GenerateDayPlanOutputSchema>;


// --- Main Exported Function ---
export async function generateDayPlan(input: GenerateDayPlanInput): Promise<{ success: boolean, data?: GenerateDayPlanOutput, error?: string }> {
    try {
        const result = await generateDayPlanFlow(input);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error in generateDayPlan:', error);
        return { success: false, error: error.message || 'Failed to generate day plan.' };
    }
}

// --- Genkit Flow Definition ---
const generatePlanPrompt = ai.definePrompt({
  name: 'generateDayPlanPrompt',
  input: { schema: GenerateDayPlanInputSchema },
  output: { schema: GenerateDayPlanOutputSchema },
  prompt: `
    You are an expert personal trainer. Your task is to create a workout for a single day based on a provided library of exercises and a specific focus. The overall objective of the plan is '{{{objective}}}'.

    Follow these instructions carefully:
    1.  Create a workout plan for a day with the focus: '{{{dayFocus}}}'.
    2.  Select between 4 to 6 exercises from the 'exercises' library that are appropriate for the day's 'focus'.
    3.  For each selected exercise, you MUST define appropriate values for 'sets', 'reps', 'rpe', 'rest' (in seconds), and 'duration' (in minutes) based on the day's focus and the overall plan objective.
        - 'reps' can be a range (e.g., '8-12') or a specific number. For cardio, it might be 'N/A'.
        - 'rpe' should be on a scale of 1-10.
        - 'duration' is the estimated time in minutes for the exercise, including rest.
    4.  Return ONLY a JSON object with an 'exercises' array containing the structured 'PlannedExercise' objects. Do not create a 'planId'.

    Available Exercises:
    \`\`\`json
    {{{json exercises}}}
    \`\`\`

    Generate the workout for today.
  `,
});


const generateDayPlanFlow = ai.defineFlow(
  {
    name: 'generateDayPlanFlow',
    inputSchema: GenerateDayPlanInputSchema,
    outputSchema: GenerateDayPlanOutputSchema,
  },
  async (input) => {
    const { output } = await generatePlanPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a day plan.");
    }
    
    // Post-process to add unique planId and missing image/muscle groups
    output.exercises = output.exercises.map((ex: any) => {
        const originalExercise = input.exercises.find(e => e.id === ex.id);
        return {
            ...ex,
            planId: `${ex.id}-${Date.now()}-${Math.random()}`,
            imageUrl: originalExercise?.imageUrl,
            muscleGroups: originalExercise?.muscleGroups || [],
        };
    });

    return output;
  }
);
