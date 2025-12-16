
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
  trainingDays: string[];
  objective?: string;
  tags?: string[];
  occupation?: string;
  birthDate?: string;
  address?: string;
  profile: {
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
  date: string; // ISO string from mock data
  coachName: string;
  coachAvatarUrl: string;
  coachAvatarHint: string;
  content: string;
};

export type MedicalHistory = {
    id: string;
    createdAt: string; // ISO date-time
    fitnessCertificate?: boolean;
    certificateDate?: string; // date
    cardiovascularDiseases?: string;
    bloodPressure?: string;
tuberculosis?: boolean;
    restingHeartRate?: number;
    diabetes?: string;
    fastingGlucose?: string;
    totalCholesterol?: string;
    triglycerides?: string;
    asthmaCopd?: boolean;
    chronicJointProblems?: string;
    discHernias?: boolean;
    osteoporosis?: boolean;
    neurologicalProblems?: boolean;
    currentMedication?: string;
    cardiovascularMedication?: boolean;
    metabolicMedication?: boolean;
    dizzinessSyncope?: boolean;
    exertionalChestPain?: boolean;
    exertionalShortnessOfBreath?: boolean;
    relevantSurgeries?: string;
    pregnancy?: boolean;
    relevantAllergies?: string;
    medicalRestrictions?: string;
    exerciseAuthorization?: string;
    riskLevel?: 'low' | 'medium' | 'high';
};

export type Biomechanics = {
    id: string;
    createdAt: string; // ISO date-time
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    bmi?: number;
    bodyFat?: number;
    muscleMass?: number;
    restingHr?: number;
    bloodPressure?: string;
    previousInjuries?: string;
    currentPain?: string;
    painZone?: string;
    shoulderMobility?: string;
    hipMobility?: string;
    ankleMobility?: string;
    spineMobility?: string;
    trunkFlexion?: string;
    shoulderPosture?: string;
    pelvicPosition?: string;
    kneeValgus?: string;
    dominance?: string;
    unipodalBalance?: number;
    pushUps?: number;
    bodyweightSquats?: number;
    abdominalPlank?: number;
    generalStrengthLevel?: string;
    cardioCapacity?: string;
    postEffortRecovery?: string;
    experienceLevel?: string;
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
  studentAvatar?: string;
};
