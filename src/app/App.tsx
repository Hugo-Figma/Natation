import { RouterProvider } from 'react-router';
import { router } from './routes';
import { WorkoutProvider } from './store/WorkoutContext';

export default function App() {
  return (
    <WorkoutProvider>
      <RouterProvider router={router} />
    </WorkoutProvider>
  );
}
