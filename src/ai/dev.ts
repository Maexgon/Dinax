'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-generated-goals.ts';
import '@/ai/flows/generate-exercise-image.ts';
import '@/ai/flows/generate-weekly-plan.ts';
