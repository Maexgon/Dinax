
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
    category?: string;
    image?: string;
    imageUrl?: string;
    equipment?: string;
    muscleGroups?: string[];
    warmup?: string;
    sets?: number | string;
    reps?: number | string;
    rpe?: number | string;
    rest?: string;
};

export type ExerciseWithId = Exercise & { id: string; };

export type Workout = {
    day: string;
    description: string;
    exercises?: Exercise[];
};

export type TrainingCycle = {
  name: string;
  duration: string;
  focus: string;
  workouts: Workout[];
};

export type TrainingPlan = {
  id: string;
  name: string;
  description: string;
  mesocycles: TrainingCycle[];
  microcycles: TrainingCycle[];
};

export type Service = {
  id: string;
  name: string;
  fee: number;
};

export type Payment = {
  id: string;
  studentId: string;
  studentName: string;
  service: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  studentName: string;
  studentAvatar?: string;
};
