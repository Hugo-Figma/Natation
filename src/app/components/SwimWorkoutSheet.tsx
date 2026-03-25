import { Waves, Activity, Zap, Wind, Heart, CheckCircle } from 'lucide-react';
import { DistanceUnit, sectionsToMeters } from '../store/WorkoutContext';

interface Exercise {
  distance: string;
  unit?: DistanceUnit;
  type: 'warmup' | 'arms' | 'legs' | 'intense' | 'recovery' | 'technical' | 'fins' | 'fullbody';
  description: string;
}

interface Section {
  title: string;
  comment?: string;
  exercises: Exercise[];
}

interface WorkoutData {
  title: string;
  date?: string;
  objective?: string;
  sections: Section[];
}

interface SwimWorkoutSheetProps {
  workout: WorkoutData;
}

export function SwimWorkoutSheet({ workout }: SwimWorkoutSheetProps) {
  const getExerciseIcon = (type: Exercise['type']) => {
    switch (type) {
      case 'warmup':   return <Waves className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'arms':     return <Activity className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'legs':
      case 'fins':     return <Wind className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'intense':  return <Zap className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'recovery': return <Heart className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'technical':return <Activity className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'fullbody': return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:         return <Activity className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getExerciseColor = (type: Exercise['type']) => {
    switch (type) {
      case 'warmup':   return 'bg-blue-100 border-blue-300';
      case 'arms':     return 'bg-cyan-100 border-cyan-300';
      case 'legs':     return 'bg-sky-100 border-sky-300';
      case 'fins':     return 'bg-teal-100 border-teal-300';
      case 'intense':  return 'bg-orange-100 border-orange-300';
      case 'recovery': return 'bg-green-100 border-green-300';
      case 'technical':return 'bg-purple-100 border-purple-300';
      case 'fullbody': return 'bg-indigo-100 border-indigo-300';
      default:         return 'bg-gray-100 border-gray-300';
    }
  };

  const getIconBgColor = (type: Exercise['type']) => {
    switch (type) {
      case 'intense':  return 'bg-red-600';
      case 'recovery': return 'bg-green-600';
      case 'warmup':   return 'bg-blue-600';
      case 'fins':     return 'bg-teal-600';
      case 'fullbody': return 'bg-indigo-600';
      case 'technical':return 'bg-purple-600';
      default:         return 'bg-cyan-600';
    }
  };

  const getTextColor = (type: Exercise['type']) => {
    switch (type) {
      case 'intense':  return 'text-red-900';
      case 'recovery': return 'text-green-900';
      default:         return 'text-gray-900';
    }
  };

  const totalDistance = sectionsToMeters(workout.sections);
  const roundedTotalDistance = Math.round(totalDistance);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 print:bg-white">
      <div className="bg-white sm:rounded-2xl sm:shadow-2xl w-full p-4 sm:p-8 print:shadow-none print:rounded-none print:max-w-none print:p-6">

        {/* En-tête */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-full shrink-0">
              <Waves className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-3xl font-bold text-gray-900 leading-tight">{workout.title}</h1>
              {workout.date && <p className="text-sm sm:text-lg text-gray-600">{workout.date}</p>}
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-2.5 sm:p-3 rounded-r">
            <p className="text-xs sm:text-sm text-gray-700">
              <span className="font-semibold">Objectif :</span>{' '}
              <span className="text-gray-500 italic">{workout.objective || '[À personnaliser]'}</span>
            </p>
          </div>
        </div>

        {/* Corps */}
        <div className="space-y-4 sm:space-y-6 mb-5">
          {workout.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Titre section */}
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="h-1 w-6 sm:w-8 bg-blue-600 rounded" />
                <h2 className="text-sm sm:text-lg font-bold text-blue-900 uppercase tracking-wide">{section.title}</h2>
                <div className="h-1 flex-1 bg-blue-200 rounded" />
              </div>
              {section.comment && (
                <p className="text-[11px] sm:text-sm text-gray-600 mb-2 italic">{section.comment}</p>
              )}

              {/* Exercices */}
              <div className="space-y-1.5 sm:space-y-2">
                {section.exercises.map((exercise, exerciseIndex) => {
                  const color = getExerciseColor(exercise.type);
                  const icon = getExerciseIcon(exercise.type);
                  const iconBg = getIconBgColor(exercise.type);
                  const textColor = getTextColor(exercise.type);

                  return (
                    <div
                      key={exerciseIndex}
                      className={`${color} border-2 rounded-xl transition-all hover:scale-[1.01] ${
                        exercise.type === 'recovery' ? 'py-1.5 sm:py-2 px-2.5 sm:px-4' : 'p-2.5 sm:p-4'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`${iconBg} p-1.5 sm:p-2 rounded-lg text-white shrink-0`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs sm:text-lg font-semibold leading-tight ${textColor} truncate`}>
                              {exercise.description}
                            </p>
                            <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 font-bold">{exercise.distance}</p>
                          </div>
                        </div>
                        {exercise.type === 'intense' && (
                          <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 fill-red-200 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Total distance */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Distance totale</p>
              <p className="text-2xl sm:text-3xl font-bold">{roundedTotalDistance}m</p>
            </div>
            <Waves className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold">Temps total</label>
              <div className="border-b border-gray-300 mt-1 pb-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold">Ressenti</label>
              <div className="border-b border-gray-300 mt-1 pb-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-semibold">Commentaires</label>
            <div className="border-b border-gray-300 mt-1 pb-1" />
          </div>
          <div className="flex items-center gap-2 bg-blue-50 p-2.5 sm:p-3 rounded-lg mt-3">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            <p className="text-xs sm:text-sm text-blue-900 font-medium">💧 N'oublie pas de t'hydrater !</p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="mt-4 sm:mt-6 flex justify-center opacity-30">
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
