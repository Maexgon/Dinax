import { Student, TrainingPlan, Payment, CalendarEvent, Service } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return {
    url: img?.imageUrl || 'https://picsum.photos/seed/placeholder/200/200',
    hint: img?.imageHint || 'person',
  };
};

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatarUrl: getImage('student-1').url,
    avatarHint: getImage('student-1').hint,
    joinDate: '2023-01-15',
    currentPlan: 'Strength Builder',
    progress: 75,
    profile: {
      age: 28,
      gender: 'Male',
      weight: 85,
      height: 180,
      medicalConditions: 'None',
      biomechanicalData: 'Slight pronation in left foot. Good core stability.',
    },
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    avatarUrl: getImage('student-2').url,
    avatarHint: getImage('student-2').hint,
    joinDate: '2023-03-22',
    currentPlan: 'Cardio King',
    progress: 60,
    profile: {
      age: 32,
      gender: 'Female',
      weight: 68,
      height: 165,
      medicalConditions: 'Asthma (exercise-induced)',
      biomechanicalData: 'Excellent flexibility. Needs to improve upper body strength.',
    },
  },
  {
    id: '3',
    name: 'James Smith',
    email: 'james.s@example.com',
    avatarUrl: getImage('student-3').url,
    avatarHint: getImage('student-3').hint,
    joinDate: '2023-05-10',
    currentPlan: 'Hypertrophy Focus',
    progress: 85,
    profile: {
      age: 24,
      gender: 'Male',
      weight: 90,
      height: 185,
      medicalConditions: 'None',
      biomechanicalData: 'Strong posterior chain. Tight hip flexors.',
    },
  },
  {
    id: '4',
    name: 'Emily White',
    email: 'emily.w@example.com',
    avatarUrl: getImage('student-4').url,
    avatarHint: getImage('student-4').hint,
    joinDate: '2023-06-01',
    currentPlan: 'Endurance Runner',
    progress: 40,
    profile: {
      age: 29,
      gender: 'Female',
      weight: 62,
      height: 170,
      medicalConditions: 'None',
      biomechanicalData: 'Neutral foot strike. Benefits from single-leg stability work.',
    },
  },
];

export const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'plan-1',
    name: 'Strength Builder',
    description: 'A 12-week program designed to increase overall strength across major lifts.',
    mesocycles: [
      {
        name: 'Mesocycle 1: Accumulation (Weeks 1-4)',
        duration: '4 Weeks',
        focus: 'Volume and technique refinement',
        workouts: [],
      },
      {
        name: 'Mesocycle 2: Intensification (Weeks 5-8)',
        duration: '4 Weeks',
        focus: 'Increasing load and intensity',
        workouts: [],
      },
      {
        name: 'Mesocycle 3: Realization (Weeks 9-12)',
        duration: '4 Weeks',
        focus: 'Peaking strength and testing maxes',
        workouts: [],
      },
    ],
    microcycles: [
      {
        name: 'Microcycle 1 (Week 1)',
        duration: '1 Week',
        focus: 'Introduction to main lifts',
        workouts: [
          { day: 'Monday', description: 'Full Body: Squat 3x5, Bench Press 3x5, Barbell Row 3x5' },
          { day: 'Wednesday', description: 'Full Body: Deadlift 1x5, Overhead Press 3x5, Pull-ups 3xAMRAP' },
          { day: 'Friday', description: 'Full Body: Squat 3x5, Bench Press 3x5, Barbell Row 3x5' },
        ],
      },
      {
        name: 'Microcycle 2 (Week 2)',
        duration: '1 Week',
        focus: 'Increasing volume',
        workouts: [
          { day: 'Monday', description: 'Full Body: Squat 4x5, Bench Press 4x5, Barbell Row 4x5' },
          { day: 'Wednesday', description: 'Full Body: Deadlift 1x5, Overhead Press 4x5, Pull-ups 4xAMRAP' },
          { day: 'Friday', description: 'Full Body: Squat 4x5, Bench Press 4x5, Barbell Row 4x5' },
        ],
      },
    ],
  },
  // Add more plans if needed
];

export const mockServices: Service[] = [
  { id: 'serv-1', name: '1-on-1 Personal Training (1 hour)', fee: 75 },
  { id: 'serv-2', name: 'Monthly Coaching Plan', fee: 250 },
  { id: 'serv-3', name: 'Nutrition Consultation', fee: 100 },
  { id: 'serv-4', name: 'Group Fitness Class (Drop-in)', fee: 20 },
];


export const mockPayments: Payment[] = [
  { id: '1', studentId: '1', studentName: 'Alex Johnson', service: 'Monthly Coaching Plan', amount: 250, date: '2024-07-01', status: 'Paid' },
  { id: '2', studentId: '2', studentName: 'Maria Garcia', service: 'Monthly Coaching Plan', amount: 250, date: '2024-07-01', status: 'Paid' },
  { id: '3', studentId: '3', studentName: 'James Smith', service: 'Monthly Coaching Plan', amount: 250, date: '2024-07-01', status: 'Pending' },
  { id: '4', studentId: '4', studentName: 'Emily White', service: 'Monthly Coaching Plan', amount: 250, date: '2024-06-01', status: 'Overdue' },
  { id: '5', studentId: '1', studentName: 'Alex Johnson', service: 'Nutrition Consultation', amount: 100, date: '2024-06-15', status: 'Paid' },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Training: Alex Johnson', start: new Date(2024, 6, 25, 9, 0), end: new Date(2024, 6, 25, 10, 0), studentName: 'Alex Johnson' },
  { id: '2', title: 'Training: Maria Garcia', start: new Date(2024, 6, 26, 11, 0), end: new Date(2024, 6, 26, 12, 0), studentName: 'Maria Garcia' },
  { id: '3', title: 'Consultation: James Smith', start: new Date(2024, 6, 26, 14, 0), end: new Date(2024, 6, 26, 14, 30), studentName: 'James Smith' },
];

export const progressData = [
  { month: "Jan", "Bench Press": 80, "Squat": 100, "Deadlift": 120 },
  { month: "Feb", "Bench Press": 82, "Squat": 105, "Deadlift": 125 },
  { month: "Mar", "Bench Press": 85, "Squat": 110, "Deadlift": 135 },
  { month: "Apr", "Bench Press": 88, "Squat": 115, "Deadlift": 140 },
  { month: "May", "Bench Press": 90, "Squat": 120, "Deadlift": 145 },
  { month: "Jun", "Bench Press": 92, "Squat": 125, "Deadlift": 150 },
];

export const weightData = [
    { date: "2024-01-01", weight: 86.0 },
    { date: "2024-02-01", weight: 85.5 },
    { date: "2024-03-01", weight: 85.2 },
    { date: "2024-04-01", weight: 85.0 },
    { date: "2024-05-01", weight: 84.6 },
    { date: "2024-06-01", weight: 84.2 },
    { date: "2024-07-01", weight: 85.0 },
]
