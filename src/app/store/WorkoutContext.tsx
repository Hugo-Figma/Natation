import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ExerciseType = 'warmup' | 'arms' | 'legs' | 'intense' | 'recovery' | 'technical' | 'fins' | 'fullbody';
export type WorkoutType = 'Physique' | 'Endurance' | 'Apnée' | 'Technique' | 'Mixte' | 'Vitesse' | 'Récupération';
export type DistanceUnit = 'm' | 'km' | 'min' | 's' | 'reps';

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  warmup: 'Échauffement',
  arms: 'Bras',
  legs: 'Jambes',
  intense: 'Intensité',
  recovery: 'Récupération',
  technical: 'Technique',
  fins: 'Palmes',
  fullbody: 'Complet',
};

export const EXERCISE_TYPE_COLORS: Record<ExerciseType, string> = {
  warmup: 'bg-blue-100 text-blue-700',
  arms: 'bg-cyan-100 text-cyan-700',
  legs: 'bg-sky-100 text-sky-700',
  intense: 'bg-red-100 text-red-700',
  recovery: 'bg-green-100 text-green-700',
  technical: 'bg-purple-100 text-purple-700',
  fins: 'bg-teal-100 text-teal-700',
  fullbody: 'bg-indigo-100 text-indigo-700',
};

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, { bg: string; text: string; border: string; gradient: string; dot: string; hex: string }> = {
  Physique:     { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', gradient: 'from-orange-400 to-orange-600', dot: 'bg-orange-500',  hex: '#f97316' },
  Endurance:    { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200',   gradient: 'from-blue-400 to-blue-600',   dot: 'bg-blue-500',    hex: '#3b82f6' },
  Apnée:        { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', gradient: 'from-indigo-400 to-indigo-600', dot: 'bg-indigo-500', hex: '#6366f1' },
  Technique:    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-600', dot: 'bg-purple-500', hex: '#a855f7' },
  Mixte:        { bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-200',   gradient: 'from-teal-400 to-teal-600',   dot: 'bg-teal-500',   hex: '#14b8a6' },
  Vitesse:      { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200',    gradient: 'from-red-400 to-red-600',    dot: 'bg-red-500',    hex: '#ef4444' },
  Récupération: { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200',  gradient: 'from-green-400 to-green-600',  dot: 'bg-green-500', hex: '#22c55e' },
};

export const WORKOUT_TYPES: WorkoutType[] = ['Physique', 'Endurance', 'Apnée', 'Technique', 'Mixte', 'Vitesse', 'Récupération'];

export interface AppCalendar {
  id: string;
  name: string;
  color: string; // hex
  source: 'local' | 'imported';
  url?: string;
  visible: boolean;
}

export interface LibraryExercise {
  id: string;
  description: string;
  type: ExerciseType;
}

export interface WorkoutExercise {
  id: string;
  description: string;
  type: ExerciseType;
  distance: string;
  unit?: DistanceUnit;
}

export interface WorkoutSection {
  id: string;
  title: string;
  comment?: string;
  exercises: WorkoutExercise[];
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  sections: WorkoutSection[];
  createdAt: string;
}

export interface CompletedSession {
  id: string;
  workoutId: string;
  workoutName: string;
  workoutType: WorkoutType;
  date: string;
  totalTime?: string;
  feeling?: number;
  comments?: string;
  calendarId?: string;
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { id: 'lib-1',  description: 'Échauffement nage libre',                    type: 'warmup'    },
  { id: 'lib-2',  description: 'Échauffement dos crawlé',                    type: 'warmup'    },
  { id: 'lib-3',  description: 'Échauffement mixte 4 nages',                 type: 'warmup'    },
  { id: 'lib-4',  description: 'Bras / pullbuoy',                            type: 'arms'      },
  { id: 'lib-5',  description: 'Pullbuoy (sans palmes)',                     type: 'arms'      },
  { id: 'lib-6',  description: 'Bras crawl unilatéral',                      type: 'arms'      },
  { id: 'lib-7',  description: 'Battement / planche',                        type: 'legs'      },
  { id: 'lib-8',  description: 'Battement dos / planche',                    type: 'legs'      },
  { id: 'lib-9',  description: 'Battement vertical',                         type: 'legs'      },
  { id: 'lib-10', description: 'Battement palmes / planche',                 type: 'fins'      },
  { id: 'lib-11', description: '12,5 lent / 12,5 rapide - palmes / planche', type: 'fins'      },
  { id: 'lib-12', description: '25 rapide / 25 lent - palmes',               type: 'fins'      },
  { id: 'lib-13', description: 'Sprint 25m',                                 type: 'intense'   },
  { id: 'lib-14', description: 'Sprint 50m',                                 type: 'intense'   },
  { id: 'lib-15', description: 'Rapide : 12,5 classique / 12,5 barrage',     type: 'intense'   },
  { id: 'lib-16', description: '25 rapide / 25 lent - palmes / planche',     type: 'intense'   },
  { id: 'lib-17', description: 'Intervalles intensité max',                  type: 'intense'   },
  { id: 'lib-18', description: 'Récupération nage libre lente',              type: 'recovery'  },
  { id: 'lib-19', description: 'Récupération dos',                           type: 'recovery'  },
  { id: 'lib-20', description: 'Flottaison dos',                             type: 'recovery'  },
  { id: 'lib-21', description: 'Retour au calme nage libre',                 type: 'recovery'  },
  { id: 'lib-22', description: 'Planche « barrage »',                        type: 'technical' },
  { id: 'lib-23', description: 'Technique virages culbute',                  type: 'technical' },
  { id: 'lib-24', description: 'Nage en côte sur 1 bras',                   type: 'technical' },
  { id: 'lib-25', description: 'Apnée statique',                             type: 'technical' },
  { id: 'lib-26', description: 'Apnée dynamique',                            type: 'technical' },
  { id: 'lib-27', description: 'Complet sans palme',                         type: 'fullbody'  },
  { id: 'lib-28', description: 'Nage complète PMT',                          type: 'fullbody'  },
  { id: 'lib-29', description: '12,5 lent / 12,5 rapide - complet PMT',      type: 'fullbody'  },
  { id: 'lib-30', description: 'Nage libre endurance',                       type: 'fullbody'  },
];

const MOCK_CALENDARS: AppCalendar[] = [
  { id: 'cal-1', name: 'Personnel',  color: '#3b82f6', source: 'local',    visible: true  },
  { id: 'cal-2', name: 'Equipe 1',   color: '#22c55e', source: 'imported', url: 'webcal://equipe1.example.com/cal.ics', visible: true  },
  { id: 'cal-3', name: 'Prépa D1M2', color: '#f97316', source: 'imported', url: 'webcal://prepd1m2.example.com/cal.ics', visible: false },
];

const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'workout-1', name: 'Séance Technique', type: 'Technique', createdAt: '2026-02-20',
    sections: [
      { id: 'sec-1-1', title: 'Échauffement', comment: '10 min tranquille', exercises: [
        { id: 'ex-1-1-1', description: 'Échauffement nage libre',  type: 'warmup',  distance: '100m', unit: 'm' },
        { id: 'ex-1-1-2', description: 'Bras / pullbuoy',          type: 'arms',    distance: '150m', unit: 'm' },
        { id: 'ex-1-1-3', description: 'Battement / planche',      type: 'legs',    distance: '50m',  unit: 'm'  },
      ]},
      { id: 'sec-1-2', title: 'Séries avec palmes', comment: 'Travail vitesse', exercises: [
        { id: 'ex-1-2-1', description: 'Battement palmes / planche',                 type: 'fins',     distance: '100m', unit: 'm' },
        { id: 'ex-1-2-2', description: '12,5 lent / 12,5 rapide - palmes / planche', type: 'fins',     distance: '150m', unit: 'm' },
        { id: 'ex-1-2-3', description: 'Récupération nage libre lente',              type: 'recovery', distance: '50m',  unit: 'm'  },
        { id: 'ex-1-2-4', description: '25 rapide / 25 lent - palmes / planche',     type: 'intense',  distance: '150m', unit: 'm' },
        { id: 'ex-1-2-5', description: 'Récupération nage libre lente',              type: 'recovery', distance: '50m',  unit: 'm'  },
      ]},
      { id: 'sec-1-3', title: 'Technique et vitesse', comment: 'Focus virages', exercises: [
        { id: 'ex-1-3-1', description: 'Planche « barrage »',                    type: 'technical', distance: '100m', unit: 'm' },
        { id: 'ex-1-3-2', description: 'Rapide : 12,5 classique / 12,5 barrage', type: 'intense',   distance: '100m', unit: 'm' },
      ]},
    ],
  },
  {
    id: 'workout-2', name: 'Endurance longue distance', type: 'Endurance', createdAt: '2026-03-01',
    sections: [
      { id: 'sec-2-1', title: 'Échauffement', comment: '8-10 min progressif', exercises: [
        { id: 'ex-2-1-1', description: 'Échauffement mixte 4 nages', type: 'warmup', distance: '200m', unit: 'm' },
        { id: 'ex-2-1-2', description: 'Pullbuoy (sans palmes)',      type: 'arms',   distance: '250m', unit: 'm' },
      ]},
      { id: 'sec-2-2', title: 'Bloc endurance', comment: 'Travail constant', exercises: [
        { id: 'ex-2-2-1', description: 'Nage libre endurance', type: 'fullbody',  distance: '400m', unit: 'm' },
        { id: 'ex-2-2-2', description: 'Récupération dos',     type: 'recovery',  distance: '100m', unit: 'm' },
        { id: 'ex-2-2-3', description: 'Nage libre endurance', type: 'fullbody',  distance: '400m', unit: 'm' },
      ]},
      { id: 'sec-2-3', title: 'Retour au calme', comment: 'Souple', exercises: [
        { id: 'ex-2-3-1', description: 'Retour au calme nage libre', type: 'recovery', distance: '100m', unit: 'm' },
      ]},
    ],
  },
  {
    id: 'workout-3', name: 'Apnée et souffle', type: 'Apnée', createdAt: '2026-03-10',
    sections: [
      { id: 'sec-3-1', title: 'Échauffement', comment: 'Respiration contrôlée', exercises: [
        { id: 'ex-3-1-1', description: 'Échauffement nage libre', type: 'warmup', distance: '200m', unit: 'm' },
        { id: 'ex-3-1-2', description: 'Battement / planche',     type: 'legs',   distance: '100m', unit: 'm' },
      ]},
      { id: 'sec-3-2', title: 'Travail apnée', comment: 'Prendre le temps de récupération', exercises: [
        { id: 'ex-3-2-1', description: 'Apnée statique',               type: 'technical', distance: '3×30s', unit: 's' },
        { id: 'ex-3-2-2', description: 'Récupération nage libre lente', type: 'recovery', distance: '50m',   unit: 'm'   },
        { id: 'ex-3-2-3', description: 'Apnée dynamique',               type: 'technical', distance: '4×25m', unit: 'm' },
        { id: 'ex-3-2-4', description: 'Récupération nage libre lente', type: 'recovery', distance: '100m',  unit: 'm'  },
      ]},
      { id: 'sec-3-3', title: 'Finition', comment: 'Doucement', exercises: [
        { id: 'ex-3-3-1', description: 'Nage complète PMT',          type: 'fullbody',  distance: '200m', unit: 'm' },
        { id: 'ex-3-3-2', description: 'Retour au calme nage libre', type: 'recovery',  distance: '100m', unit: 'm' },
      ]},
    ],
  },
  {
    id: 'workout-4', name: 'Force et puissance', type: 'Physique', createdAt: '2026-03-08',
    sections: [
      { id: 'sec-4-1', title: 'Activation', comment: '8 min', exercises: [
        { id: 'ex-4-1-1', description: 'Échauffement nage libre', type: 'warmup', distance: '200m', unit: 'm' },
      ]},
      { id: 'sec-4-2', title: 'Travail de puissance', comment: 'Récup 1min entre séries', exercises: [
        { id: 'ex-4-2-1', description: 'Sprint 25m',                    type: 'intense',  distance: '8×25m', unit: 'm' },
        { id: 'ex-4-2-2', description: 'Récupération nage libre lente', type: 'recovery', distance: '50m',   unit: 'm'   },
        { id: 'ex-4-2-3', description: 'Intervalles intensité max',     type: 'intense',  distance: '4×50m', unit: 'm' },
        { id: 'ex-4-2-4', description: 'Récupération nage libre lente', type: 'recovery', distance: '100m',  unit: 'm'  },
      ]},
      { id: 'sec-4-3', title: 'Cool down', comment: 'Fin très souple', exercises: [
        { id: 'ex-4-3-1', description: 'Retour au calme nage libre', type: 'recovery', distance: '200m', unit: 'm' },
      ]},
    ],
  },
];

const MOCK_SESSIONS: CompletedSession[] = [
  { id: 'session-1', workoutId: 'workout-1', workoutName: 'Séance Technique',         workoutType: 'Technique', date: '2026-02-24', totalTime: '1h10', feeling: 4, comments: "Bonne séance, les virages culbutes s'améliorent.",  calendarId: 'cal-2' },
  { id: 'session-2', workoutId: 'workout-2', workoutName: 'Endurance longue distance', workoutType: 'Endurance', date: '2026-03-05', totalTime: '1h25', feeling: 3, comments: 'Dur sur la deuxième partie.',                         calendarId: 'cal-1' },
  { id: 'session-3', workoutId: 'workout-4', workoutName: 'Force et puissance',        workoutType: 'Physique',  date: '2026-03-10', totalTime: '1h15', feeling: 5, comments: "Excellente séance !",                                calendarId: 'cal-2' },
  { id: 'session-4', workoutId: 'workout-3', workoutName: 'Apnée et souffle',          workoutType: 'Apnée',     date: '2026-03-15', totalTime: '1h00', feeling: 5, comments: "Record personnel : 2min15 !",                       calendarId: 'cal-3' },
  { id: 'session-5', workoutId: 'workout-1', workoutName: 'Séance Technique',         workoutType: 'Technique', date: '2026-03-20', totalTime: '1h05', feeling: 4, comments: "Bonne reprise après une semaine de pause.",           calendarId: 'cal-1' },
];

interface WorkoutContextType {
  exerciseLibrary: LibraryExercise[];
  workouts: Workout[];
  sessions: CompletedSession[];
  calendars: AppCalendar[];
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => string;
  deleteWorkout: (id: string) => void;
  addSession: (session: Omit<CompletedSession, 'id'>) => void;
  updateSession: (id: string, updates: Partial<CompletedSession>) => void;
  deleteSession: (id: string) => void;
  addCalendar: (cal: Omit<AppCalendar, 'id'>) => void;
  updateCalendar: (id: string, updates: Partial<AppCalendar>) => void;
  deleteCalendar: (id: string) => void;
  toggleCalendarVisibility: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

const WORKOUTS_STORAGE_KEY = 'natation.workouts.v1';

const inferUnit = (distance: string): DistanceUnit => {
  const val = (distance ?? '').trim().toLowerCase();
  // First regex matches standalone unit, second matches "number + unit" with optional space
  if (/\bkm\b/i.test(val) || /\d\s*km\b/i.test(val)) return 'km';
  if (/\bmin\b/i.test(val) || /\d\s*min\b/i.test(val)) return 'min';
  if (/\bs\b/i.test(val) || /\d\s*s\b/i.test(val)) return 's';
  if (/rép\.?$/i.test(val) || /\brep\b/i.test(val)) return 'reps';
  return 'm';
};

/**
 * Extracts the numeric quantity from a distance string.
 * Supports:
 * - Multiplicative patterns like "4x50m", "3×25" (returns 200, 75)
 * - Simple numbers like "100m" or "1.2km" (returns 100 or 1.2)
 * Commas are normalized to dots. Returns null when no number is found.
 */
const extractNumericAmount = (distance: string): number | null => {
  const normalized = (distance ?? '').replace(',', '.');
  const multi = normalized.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (multi) return parseFloat(multi[1]) * parseFloat(multi[2]);
  const single = normalized.match(/(\d+(?:\.\d+)?)/);
  return single ? parseFloat(single[1]) : null;
};

export const exerciseToMeters = (exercise: WorkoutExercise): number => {
  const unit = exercise.unit ?? inferUnit(exercise.distance);
  if (unit !== 'm' && unit !== 'km') return 0;
  const amount = extractNumericAmount(exercise.distance);
  if (amount == null || Number.isNaN(amount)) return 0;
  return unit === 'km' ? amount * 1000 : amount;
};

export const sectionsToMeters = (sections: WorkoutSection[]) =>
  sections.reduce(
    (sum, section) =>
      sum + section.exercises.reduce((ss, ex) => ss + exerciseToMeters(ex), 0),
    0
  );

const normalizeExercise = (exercise: WorkoutExercise): WorkoutExercise => ({
  ...exercise,
  distance: exercise.distance ?? '',
  unit: exercise.unit ?? inferUnit(exercise.distance),
});

const normalizeWorkout = (workout: Workout): Workout => ({
  ...workout,
  sections: workout.sections.map(section => ({
    ...section,
    comment: section.comment ?? '',
    exercises: section.exercises.map(normalizeExercise),
  })),
});

const loadStoredWorkouts = () => {
  if (typeof window === 'undefined') return MOCK_WORKOUTS;
  const raw = localStorage.getItem(WORKOUTS_STORAGE_KEY);
  if (!raw) return MOCK_WORKOUTS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(normalizeWorkout);
  } catch {
    /* ignore corrupt storage */
  }
  return MOCK_WORKOUTS;
};

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>(loadStoredWorkouts);
  const [sessions, setSessions] = useState<CompletedSession[]>(MOCK_SESSIONS);
  const [calendars, setCalendars] = useState<AppCalendar[]>(MOCK_CALENDARS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = (workout: Omit<Workout, 'id' | 'createdAt'>): string => {
    const id = `workout-${Date.now()}`;
    const newWorkout: Workout = normalizeWorkout({
      ...workout,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    });
    setWorkouts(prev => [newWorkout, ...prev]);
    return id;
  };

  const deleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));

  const addSession = (session: Omit<CompletedSession, 'id'>) => {
    setSessions(prev => [...prev, { ...session, id: `session-${Date.now()}` }]);
  };

  const updateSession = (id: string, updates: Partial<CompletedSession>) =>
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

  const deleteSession = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));

  const addCalendar = (cal: Omit<AppCalendar, 'id'>) =>
    setCalendars(prev => [...prev, { ...cal, id: `cal-${Date.now()}` }]);

  const updateCalendar = (id: string, updates: Partial<AppCalendar>) =>
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const deleteCalendar = (id: string) => setCalendars(prev => prev.filter(c => c.id !== id));

  const toggleCalendarVisibility = (id: string) =>
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));

  return (
    <WorkoutContext.Provider value={{
      exerciseLibrary: EXERCISE_LIBRARY, workouts, sessions, calendars,
      addWorkout, deleteWorkout, addSession, updateSession, deleteSession,
      addCalendar, updateCalendar, deleteCalendar, toggleCalendarVisibility,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkout must be used within WorkoutProvider');
  return context;
}
