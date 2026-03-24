import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { WorkoutListPage } from './components/WorkoutListPage';
import { WorkoutCreatePage } from './components/WorkoutCreatePage';
import { WorkoutDetailPage } from './components/WorkoutDetailPage';
import { CalendarPage } from './components/CalendarPage';

const rawBase = import.meta.env.BASE_URL ?? '/';
const basename = rawBase.endsWith('/') ? rawBase.slice(0, -1) || '/' : rawBase;

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Layout,
      children: [
        { index: true, Component: WorkoutListPage },
        { path: 'workouts/new', Component: WorkoutCreatePage },
        { path: 'workouts/:id', Component: WorkoutDetailPage },
        { path: 'calendar', Component: CalendarPage },
      ],
    },
  ],
  { basename }
);
