import { SwimWorkoutSheet } from './components/SwimWorkoutSheet';

export default function App() {
  const workoutData = {
    title: 'ENTRAÎNEMENT NATATION',
    date: '24/02/2025',
    objective: 'Technique et endurance',
    sections: [
      {
        title: 'Échauffement',
        exercises: [
          { distance: '100m', type: 'warmup' as const, description: 'Échauffement' },
          { distance: '150m', type: 'arms' as const, description: 'Bras / pullbuoy' },
          { distance: '50m', type: 'legs' as const, description: 'Battement / planche' }
        ]
      },
      {
        title: 'Séries avec palmes',
        exercises: [
          { distance: '100m', type: 'fins' as const, description: 'Battement palmes / planche' },
          { distance: '150m', type: 'fins' as const, description: '12,5 lent / 12,5 rapide - palmes / planche' },
          { distance: '50m', type: 'recovery' as const, description: 'Récupération' },
          { distance: '150m', type: 'intense' as const, description: '25 rapide / 25 lent - palmes / planche' },
          { distance: '50m', type: 'recovery' as const, description: 'Récupération' }
        ]
      },
     // {
     //   title: 'Travail complet PMT',
     //   exercises: [
     //     { distance: '150m', type: 'fullbody' as const, description: '12,5 lent / 12,5 rapide - complet PMT' },
     //     { distance: '50m', type: 'recovery' as const, description: 'Récupération' },
     //     { distance: '200m', type: 'intense' as const, description: '25 rapide / 25 lent - complet PMT' },
     //     { distance: '50m', type: 'recovery' as const, description: 'Récupération' }
     //   ]
     // },
      {
        title: 'Technique et vitesse',
        exercises: [
          { distance: '100m', type: 'technical' as const, description: 'Planche « barrage »' },
          { distance: '100m', type: 'intense' as const, description: 'Rapide : 12,5 classique / 12,5 barrage' }
        ]
      },
      //{
 //       title: 'Récupération finale',
   //     exercises: [
     //     { distance: '250m', type: 'arms' as const, description: 'Pullbuoy (sans palmes)' },
       //   { distance: '100m', type: 'fullbody' as const, description: 'Complet sans palme' }
       // ]
    //  }
    ]
  };

  return <SwimWorkoutSheet workout={workoutData} />;
}