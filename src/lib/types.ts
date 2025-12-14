export type Student = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  avatarHint: string;
  joinDate: string;
  currentPlan: string;
  progress: number;
  profile: {
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    weight: number; // in kg
    height: number; // in cm
    medicalConditions: string;
    biomechanicalData: string;
  };
};

export type TrainingCycle = {
  name: string;
  duration: string;
  focus: string;
  workouts: {
    day: string;
    description: string;
  }[];
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
