
import { Client, TrainingPlan, Payment, CalendarEvent, Service, Workout, Note } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(p => p.id === id);
  return {
    url: img?.imageUrl || 'https://picsum.photos/seed/placeholder/200/200',
    hint: img?.imageHint || 'person',
  };
};

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    email: 'carlos.rod@example.com',
    avatarUrl: getImage('student-1').url,
    avatarHint: getImage('student-1').hint,
    joinDate: '2022-08-20',
    currentPlan: 'Hipertrofia 4x',
    progress: 75,
    trainingDays: ['L', 'M', 'J', 'V'],
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
    name: 'Ana García',
    email: 'ana.g@example.com',
    avatarUrl: getImage('student-2').url,
    avatarHint: getImage('student-2').hint,
    joinDate: '2024-02-15',
    currentPlan: 'Funcional 3x',
    progress: 60,
    trainingDays: ['L', 'M', 'V'],
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
    name: 'David Lopez',
    email: 'david.l@example.com',
    avatarUrl: getImage('student-3').url,
    avatarHint: getImage('student-3').hint,
    joinDate: '2023-05-10',
    currentPlan: 'Personalizado Pro',
    progress: 85,
    trainingDays: ['L', 'M', 'X', 'J', 'V'],
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
    name: 'Marta Diaz',
    email: 'marta.d@example.com',
    avatarUrl: getImage('student-4').url,
    avatarHint: getImage('student-4').hint,
    joinDate: '2024-01-01',
    currentPlan: 'Pilates Reformer',
    progress: 40,
    trainingDays: ['M', 'J'],
    profile: {
      age: 29,
      gender: 'Female',
      weight: 62,
      height: 170,
      medicalConditions: 'None',
      biomechanicalData: 'Neutral foot strike. Benefits from single-leg stability work.',
    },
  },
  {
    id: '5',
    name: 'Javier Pérez',
    email: 'javier.p@example.com',
    avatarUrl: getImage('student-5').url,
    avatarHint: getImage('student-5').hint,
    joinDate: '2023-11-20',
    currentPlan: 'CrossFit 5x',
    progress: 90,
    trainingDays: ['L', 'M', 'X', 'J', 'V'],
    profile: {
        age: 30,
        gender: 'Male',
        weight: 88,
        height: 178,
        medicalConditions: 'None',
        biomechanicalData: 'Solid overhead squat form.',
    },
  },
  {
    id: '6',
    name: 'Lucía Fernández',
    email: 'lucia.f@example.com',
    avatarUrl: getImage('student-6').url,
    avatarHint: getImage('student-6').hint,
    joinDate: '2024-03-01',
    currentPlan: 'Yoga y Flexibilidad',
    progress: 50,
    trainingDays: ['M', 'X', 'V'],
    profile: {
        age: 27,
        gender: 'Female',
        weight: 60,
        height: 168,
        medicalConditions: 'None',
        biomechanicalData: 'Good range of motion in hips.',
    },
  },
];

const mondayWorkout: Workout = {
    day: 'Monday',
    description: 'Legs Focus',
    exercises: [
        { name: 'Barbell Squat', warmup: 'Warmup: 1 x 15', sets: 4, reps: '6-8', rpe: 8, rest: '120s', image: 'https://picsum.photos/seed/squat/100/100' },
        { name: 'Leg Extension', sets: 3, reps: '12-15', rpe: 9, rest: '90s', image: 'https://picsum.photos/seed/leg_extension/100/100' },
    ]
};

const wednesdayWorkout: Workout = {
    day: 'Wednesday',
    description: 'Push Focus',
    exercises: [
        { name: 'Bench Press', sets: 4, reps: '8-10', rpe: 8.5, rest: '120s', image: 'https://picsum.photos/seed/bench_press/100/100' },
        { name: 'OHP (Dumbbells)', sets: 3, reps: '10-12', rpe: 9, rest: '90s', image: 'https://picsum.photos/seed/ohp_dumbbells/100/100' },
    ]
};

const fridayWorkout: Workout = {
    day: 'Friday',
    description: 'Pull Focus',
    exercises: [
        { name: 'Deadlift', sets: 1, reps: 5, rpe: 8, rest: '180s', image: 'https://picsum.photos/seed/deadlift_friday/100/100' },
        { name: 'Pull-ups', sets: 4, reps: 'AMRAP', rpe: 9, rest: '120s', image: 'https://picsum.photos/seed/pullups/100/100' },
    ]
};


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
          mondayWorkout,
          wednesdayWorkout,
          fridayWorkout,
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
  { id: 'pay-1', studentId: '1', studentName: 'Carlos Rodriguez', service: 'Hipertrofia 4x', amount: 65, date: '2024-02-15T00:00:00', status: 'Paid' },
  { id: 'pay-2', studentId: '1', studentName: 'Carlos Rodriguez', service: 'Hipertrofia 4x', amount: 65, date: '2024-01-14T00:00:00', status: 'Paid' },
  { id: 'pay-3', studentId: '2', studentName: 'Ana García', service: 'Funcional 3x', amount: 50, date: '2024-07-01T00:00:00', status: 'Pending' },
  { id: 'pay-4', studentId: '3', studentName: 'David Lopez', service: 'Personalizado Pro', amount: 90, date: '2024-07-01T00:00:00', status: 'Paid' },
  { id: 'pay-5', studentId: '4', studentName: 'Marta Diaz', service: 'Pilates Reformer', amount: 75, date: '2024-06-01T00:00:00', status: 'Overdue' },
  { id: 'pay-6', studentId: '5', studentName: 'Javier Pérez', service: 'CrossFit 5x', amount: 80, date: '2024-07-05T00:00:00', status: 'Paid' },
  { id: 'pay-7', studentId: '6', studentName: 'Lucía Fernández', service: 'Yoga y Flexibilidad', amount: 45, date: '2024-07-03T00:00:00', status: 'Pending' },
];

const now = new Date();

export const mockCalendarEvents: CalendarEvent[] = [
    { id: '1', title: 'HIIT Intenso', start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30), studentName: 'Carlos Rodriguez' },
    { id: '2', title: 'Yoga & Flexibilidad', start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0), studentName: 'Ana García' },
    { id: '3', title: 'Fuerza Superior', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0), studentName: 'David Lopez' },
    { id: '4', title: 'Evaluación Mensual', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 10, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 10, 30), studentName: 'Marta Diaz' },
    { id: '5', title: 'Cardio Box', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 15, 0), studentName: 'Javier Pérez' },
    { id: '6', title: 'CrossFit', start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 12, 0), studentName: 'Lucía Fernández' },
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
];

export const bodyCompositionData = [
    { month: 'Ene', fatPercentage: 22.5, muscleMass: 40.1 },
    { month: 'Feb', fatPercentage: 22.1, muscleMass: 40.5 },
    { month: 'Mar', fatPercentage: 21.5, muscleMass: 41.2 },
    { month: 'Abr', fatPercentage: 20.9, muscleMass: 41.8 },
    { month: 'May', fatPercentage: 20.2, muscleMass: 42.5 },
    { month: 'Jun', fatPercentage: 19.8, muscleMass: 43.1 },
];

export const muscleMassData = [
    { month: 'M1', muscle: 41.2 },
    { month: 'M2', muscle: 41.8 },
    { month: 'M3', muscle: 42.5 },
    { month: 'M4', muscle: 43.1 },
    { month: 'Actual', muscle: 43.5 },
];

export const goalProgressData = [
    { name: 'Progress', progress: 75, fill: 'var(--color-progress)' },
];


const coachImage = getImage('student-1');

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    coachName: 'Coach Sara',
    coachAvatarUrl: coachImage.url,
    coachAvatarHint: coachImage.hint,
    createdAt: '2024-07-15T10:30:00Z',
    content: 'El cliente muestra una mejora significativa en la sentadilla. Aumentar el peso la próxima semana. Ligera molestia en el hombro derecho al hacer press de banca, monitorizar.'
  },
  {
    id: 'note-2',
    coachName: 'Coach Sara',
    coachAvatarUrl: coachImage.url,
    coachAvatarHint: coachImage.hint,
    createdAt: '2024-07-08T11:00:00Z',
    content: 'Buena energía hoy. Foco en la técnica de peso muerto. Recordarle la importancia de la hidratación.'
  }
];
