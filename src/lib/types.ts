import { Timestamp } from 'firebase/firestore';

export type Client = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  avatarHint?: string;
  joinDate?: string;
  currentPlan?: string;
  planType?: string;
  progress?: number;
  trainingDays?: string[];
  objective?: string;
  tags?: string[];
  occupation?: string;
  birthDate?: string;
  address?: string;
  profile?: {
      age: number;
      gender: string;
      weight: number;
      height: number;
      medicalConditions: string;
      biomechanicalData: string;
  };
};

export type Note = {
  id: string;
  createdAt: string | Timestamp;
  coachName: string;
  coachAvatarUrl: string;
  coachAvatarHint: string;
  content: string;
};

export type MedicalHistory = {
    id: string;
    createdAt: string | Timestamp;
    medicalClearance?: boolean;
    bloodType?: string;
    currentConditions?: string[];
    underMedicalTreatment?: boolean;
    currentMedications?: string[];
    preexistingInjuries?: string[];
    previousSurgeries?: string[];
    chronicPain?: boolean;
    medicalRestrictions?: string[];
    emergencyContact?: {
        name: string;
        phone: string;
    };
};

export type Biomechanics = {
    id: string;
    createdAt: string | Timestamp;
    weight: number;
    height: number;
    bmi?: number;
    ankleDorsiflexion?: number;
    hipMobility?: number;
    shoulderMobility?: number;
    coreStability?: number;
    hipStability?: number;
    squatPattern?: number;
    hipHingePattern?: number;
    relativeStrengthLower?: number;
    relativeStrengthUpper?: number;
    unilateralBalance?: number;
    asymmetries?: number;
    movementPain?: number;
};


export type Exercise = {
    name: string;
    type?: string;
    category?: string;
    image?: string;
    imageUrl?: string;
    equipment?: string;
    difficulty?: string;
    instructions?: string;
    muscleGroups?: string[];
    videoUrl?: string;
    warmup?: string;
    sets?: number | string;
    reps?: number | string;
    rpe?: number | string;
    rest?: string;
    duration?: string;
};

export type ExerciseWithId = Exercise & { id: string; };

export type PlannedExercise = ExerciseWithId & {
    planId: string;
    sets: string;
    reps: string;
    rpe: string;
    rest: string;
    duration: string;
};


export type Workout = {
    day: string;
    description: string;
    exercises?: PlannedExercise[];
};

export type TrainingCycle = {
  name: string;
  duration: string;
  focus: string;
  workouts: Workout[];
};

export type Mesocycle = {
    id: string;
    clientId: string;
    year: number;
    month: number;
    weeks: {
        [week: number]: {
            [day: string]: {
                focus: string;
                isRestDay: boolean;
                exercises: PlannedExercise[];
            }
        }
    };
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type PlanSummary = {
    id: string;
    title: string;
    focus: string;
    clientId: string;
    clientName?: string;
    clientAvatar?: string;
    trainingDays: number;
    duration: number; // in minutes
}


export type Service = {
  id: string;
  name: string;
  fee: number;
};

export type Payment = {
  id: string;
  clientId: string;
  clientPlanId: string;
  servicePlanId: string;
  amount: number;
  paymentDate: string | Timestamp;
  status: 'paid' | 'pending' | 'overdue';
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date | Timestamp;
  end: Date | Timestamp;
  type: 'group' | 'individual';
  location?: string;
  workPlan?: string;
  instructions?: string;
  clients?: string[];
};

export type ServicePlan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: 'usd' | 'eur' | 'ars';
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'once';
  hasPromo: boolean;
  promoType?: 'percentage' | 'fixed';
  promoValue?: number;
  promoDuration?: 'indefinite' | 'first_month' | 'custom';
  promoMonths?: number;
  benefits: { text: string }[];
};

export type ClientPlan = {
    id: string;
    clientId: string;
    servicePlanId: string;
    trainingDays: string[];
    hoursPerClass: number;
    monthlyCost: number;
    paymentMethod: 'cash' | 'card' | 'transfer';
    createdAt: Timestamp;
};

export type AppSettings = {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: 'es' | 'en';
  location?: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  googleCalendarSync: boolean;
};
