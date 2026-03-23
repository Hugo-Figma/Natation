import { Waves, Timer, Activity, Zap, Wind, Heart, CheckCircle } from 'lucide-react';

interface Exercise {
  distance: string;
  type: 'warmup' | 'arms' | 'legs' | 'intense' | 'recovery' | 'technical' | 'fins' | 'fullbody';
  description: string;
}

interface Section {
  title: string;
  exercises: Exercise[];
}

interface WorkoutData {
  title: string;
  date: string;
  objective?: string;
  sections: Section[];
}

interface SwimWorkoutSheetProps {
  workout: WorkoutData;
}

export function SwimWorkoutSheet({ workout }: SwimWorkoutSheetProps) {
  const getExerciseIcon = (type: Exercise['type']) => {
    switch (type) {
      case 'warmup':
        return <Waves className="w-5 h-5" />;
      case 'arms':
        return <Activity className="w-5 h-5" />;
      case 'legs':
      case 'fins':
        return <Wind className="w-5 h-5" />;
      case 'intense':
        return <Zap className="w-5 h-5" />;
      case 'recovery':
        return <Heart className="w-5 h-5" />;
      case 'technical':
        return <Activity className="w-5 h-5" />;
      case 'fullbody':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getExerciseColor = (type: Exercise['type']) => {
    switch (type) {
      case 'warmup':
        return 'bg-blue-100 border-blue-300';
      case 'arms':
        return 'bg-cyan-100 border-cyan-300';
      case 'legs':
        return 'bg-sky-100 border-sky-300';
      case 'fins':
        return 'bg-teal-100 border-teal-300';
      case 'intense':
        return 'bg-orange-100 border-orange-300';
      case 'recovery':
        return 'bg-green-100 border-green-300';
      case 'technical':
        return 'bg-purple-100 border-purple-300';
      case 'fullbody':
        return 'bg-indigo-100 border-indigo-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getIconBgColor = (type: Exercise['type']) => {
    switch (type) {
      case 'intense':
        return 'bg-red-600';
      case 'recovery':
        return 'bg-green-600';
      case 'warmup':
        return 'bg-blue-600';
      case 'fins':
        return 'bg-teal-600';
      case 'fullbody':
        return 'bg-indigo-600';
      case 'technical':
        return 'bg-purple-600';
      default:
        return 'bg-cyan-600';
    }
  };

  const totalDistance = workout.sections.reduce(
    (sum, section) => 
      sum + section.exercises.reduce((sectionSum, ex) => sectionSum + parseInt(ex.distance), 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-10 print:shadow-none" style={{ aspectRatio: '210/297' }}>
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-blue-600 p-3 rounded-full">
              <Waves className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{workout.title}</h1>
              <p className="text-lg text-gray-600">{workout.date}</p>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Objectif :</span>{' '}
              <span className="text-gray-500 italic">{workout.objective || '[À personnaliser]'}</span>
            </p>
          </div>
        </div>

        {/* Corps - Liste des sections et exercices */}
        <div className="space-y-6 mb-6">
          {workout.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Titre de section */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 bg-blue-600 rounded"></div>
                <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="h-1 flex-1 bg-blue-200 rounded"></div>
              </div>

              {/* Exercices de la section */}
              <div className="space-y-2">
                {section.exercises.map((exercise, exerciseIndex) => {
                  const color = getExerciseColor(exercise.type);
                  const icon = getExerciseIcon(exercise.type);
                  const iconBg = getIconBgColor(exercise.type);

                  return (
                    <div
                      key={exerciseIndex}
                      className={`${color} border-2 rounded-xl p-4 transition-all hover:scale-[1.01] ${
                        exercise.type === 'recovery' ? 'py-2' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`${iconBg} p-2 rounded-lg text-white shrink-0`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-lg font-semibold leading-tight ${
                              exercise.type === 'intense' ? 'text-red-900' :
                              exercise.type === 'recovery' ? 'text-green-900' :
                              'text-gray-900'
                            }`}>
                              {exercise.description}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">{exercise.distance}</p>
                          </div>
                        </div>
                        {exercise.type === 'intense' && (
                          <Zap className="w-6 h-6 text-red-600 fill-red-200 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Statistiques */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Distance totale</p>
              <p className="text-3xl font-bold">{totalDistance}m</p>
            </div>
            <Waves className="w-12 h-12 opacity-50" />
          </div>
        </div>

        {/* Pied de page */}
        <div className="border-t-2 border-gray-200 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold">Temps total</label>
              <div className="border-b border-gray-300 mt-1 pb-1"></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Ressenti</label>
              <div className="border-b border-gray-300 mt-1 pb-1"></div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold">Commentaires</label>
            <div className="border-b border-gray-300 mt-1 pb-1"></div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg mt-4">
            <Heart className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-900 font-medium">💧 N'oublie pas de t'hydrater !</p>
          </div>
        </div>

        {/* Illustration piscine */}
        <div className="mt-6 flex justify-center opacity-30">
          <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20 Q10 10, 20 20 T40 20 T60 20 T80 20 T100 20 T120 20 T140 20 T160 20 T180 20 T200 20" stroke="#3B82F6" strokeWidth="2" fill="none"/>
            <path d="M0 25 Q10 15, 20 25 T40 25 T60 25 T80 25 T100 25 T120 25 T140 25 T160 25 T180 25 T200 25" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0 30 Q10 20, 20 30 T40 30 T60 30 T80 30 T100 30 T120 30 T140 30 T160 30 T180 30 T200 30" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}