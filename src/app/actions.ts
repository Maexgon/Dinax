'use server';

import { suggestGoals, type SuggestGoalsInput } from '@/ai/flows/ai-generated-goals';
import { generateExerciseImage, type GenerateExerciseImageInput } from '@/ai/flows/generate-exercise-image';
import { generateWeeklyPlan as generateWeeklyPlanFlow, type GenerateWeeklyPlanInput, type GenerateWeeklyPlanOutput } from '@/ai/flows/generate-weekly-plan';

// A mock for past performance data. In a real app, this would be fetched from a database.
const pastPerformanceData = `
- Bench Press 1RM: 90kg (5kg increase in 3 months)
- Squat 1RM: 120kg (10kg increase in 3 months)
- Deadlift 1RM: 150kg (15kg increase in 3 months)
- Average weekly volume: 12,000kg
- Adherence to plan: 85%
- Cardio: 2 sessions per week, 30 minutes each.
`;

export async function getAIGoalSuggestions(studentProfile: SuggestGoalsInput['studentProfile']) {
  try {
    const input: SuggestGoalsInput = {
      studentProfile,
      pastPerformanceData,
    };
    const result = await suggestGoals(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getAIGoalSuggestions:', error);
    return { success: false, error: 'Failed to get AI suggestions. Please try again.' };
  }
}

export async function getAIExerciseImage(input: GenerateExerciseImageInput) {
  try {
    const result = await generateExerciseImage(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in getAIExerciseImage server action:', error);
    return { success: false, error: `Failed to generate AI image: ${error.message}` };
  }
}

export async function generateWeeklyPlan(input: GenerateWeeklyPlanInput): Promise<{ success: boolean, data?: GenerateWeeklyPlanOutput, error?: string }> {
  try {
    const result = await generateWeeklyPlanFlow(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in generateWeeklyPlan:', error);
    return { success: false, error: error.message || 'Failed to generate weekly plan.' };
  }
}
