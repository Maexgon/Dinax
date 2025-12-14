export type Student = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  avatarHint: string;
  joinDate: string;
  currentPlan: string;
  progress: number;
  trainingDays: string[];
  profile: {
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    weight: number; // in kg
    height: number; // in cm
    medicalConditions: string;
    biomechanicalData: string;
  };
};

export type Exercise = {
    name: string;
    category?: string;
    image: string;
    warmup?: string;
    sets?: number | string;
    reps?: number | string;
    rpe?: number | string;
    rest?: string;
};

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
};
