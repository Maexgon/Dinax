'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a full weekly training plan.
 * 
 * The flow acts as an expert personal trainer, creating a structured, day-by-day workout
 * schedule based on a library of available exercises and specified daily focuses.
 * It includes:
 *  - `generateWeeklyPlan`: The main function to trigger the plan generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Input Schemas ---
const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Cardio", "Fuerza", "Pylo", "Movilidad", "Core"]).optional(),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.string().optional(),
});

export const GenerateWeeklyPlanInputSchema = z.object({
  exercises: z.array(ExerciseSchema).describe("The library of available exercises to choose from."),
  weekSchedule: z
    .array(z.object({ day: z.string(), focus: z.string(), id: z.string() }))
    .describe("An array defining the focus for each day of the week."),
  objective: z.string().describe("The main goal of the training plan, e.g., 'Hypertrophy', 'Fat Loss'.")
});
export type GenerateWeeklyPlanInput = z.infer<typeof GenerateWeeklyPlanInputSchema>;

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

const DayPlanSchema = z.object({
  focus: z.string(),
  isRestDay: z.boolean(),
  exercises: z.array(PlannedExerciseSchema),
});

export const GenerateWeeklyPlanOutputSchema = z.record(z.string(), DayPlanSchema);
export type GenerateWeeklyPlanOutput = z.infer<typeof GenerateWeeklyPlanOutputSchema>;


// --- Main Exported Function ---
export async function generateWeeklyPlan(input: GenerateWeeklyPlanInput): Promise<GenerateWeeklyPlanOutput> {
  return generateWeeklyPlanFlow(input);
}


// --- Genkit Flow Definition ---
const generatePlanPrompt = ai.definePrompt({
  name: 'generateWeeklyPlanPrompt',
  input: { schema: GenerateWeeklyPlanInputSchema },
  output: { schema: GenerateWeeklyPlanOutputSchema },
  prompt: `
    You are an expert personal trainer. Your task is to create a complete, structured, and coherent weekly training plan based on a provided library of exercises and a schedule with a specific focus for each day. The overall objective of the plan is '{{{objective}}}'.

    Follow these instructions carefully:
    1.  For each day in the 'weekSchedule', create a workout plan. The key for each day in the output object must be the day's 'id' (e.g., 'L', 'M').
    2.  If a day's focus is 'Descanso' (Rest), set 'isRestDay' to true and leave the 'exercises' array empty.
    3.  For training days, select between 4 to 6 exercises from the 'exercises' library that are appropriate for the day's 'focus'.
    4.  Ensure a logical progression and variety throughout the week. Avoid using the exact same exercise on multiple days if possible, unless it's a core compound lift.
    5.  For each selected exercise, you MUST define appropriate values for 'sets', 'reps', 'rpe', 'rest' (in seconds), and 'duration' (in minutes) based on the day's focus and the overall plan objective.
        - 'reps' can be a range (e.g., '8-12') or a specific number. For cardio, it might be 'N/A'.
        - 'rpe' should be on a scale of 1-10.
        - 'duration' is the estimated time in minutes for the exercise, including rest.
    6.  The output MUST be a JSON object where each key is the day's identifier (e.g., 'L' for Lunes, 'M' for Martes) and the value is the structured 'DayPlan'.
    7. Just return the 'id' of the exercise from the library. Do not create a 'planId'.

    Available Exercises:
    \`\`\`json
    {{{json exercises}}}
    \`\`\`

    Weekly Schedule and Focuses:
    \`\`\`json
    {{{json weekSchedule}}}
    \`\`\`

    Generate the weekly plan.
  `,
});


const generateWeeklyPlanFlow = ai.defineFlow(
  {
    name: 'generateWeeklyPlanFlow',
    inputSchema: GenerateWeeklyPlanInputSchema,
    outputSchema: GenerateWeeklyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await generatePlanPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a weekly plan.");
    }
    
    // Post-process to add unique planId and missing image/muscle groups
    Object.values(output).forEach(dayPlan => {
        if (dayPlan.exercises) {
            dayPlan.exercises = dayPlan.exercises.map((ex: any) => {
                const originalExercise = input.exercises.find(e => e.id === ex.id);
                return {
                    ...ex,
                    planId: `${ex.id}-${Date.now()}-${Math.random()}`,
                    imageUrl: originalExercise?.imageUrl || 'https://picsum.photos/seed/placeholder/100/100',
                    muscleGroups: originalExercise?.muscleGroups || [],
                };
            });
        }
    });

    return output;
  }
);
