import { useRef } from 'react';
import { Link } from 'react-router';
import { Plus, Waves, Trash2, Eye, Dumbbell, ChevronRight, Star, Copy, Download, Upload } from 'lucide-react';
import { useWorkout, WORKOUT_TYPE_COLORS, WorkoutType, Workout } from '../store/WorkoutContext';

function getTotalDistance(sections: { exercises: { distance: string }[] }[]) {
  return sections.reduce(
    (sum, s) => sum + s.exercises.reduce((ss, ex) => {
      const m = ex.distance.match(/^(\d+)/);
      return ss + (m ? parseInt(m[1]) : 0);
    }, 0), 0
  );
}

function exportWorkoutJSON(workout: Workout) {
  const data = {
    name: workout.name, type: workout.type,
    sections: workout.sections.map(s => ({
      title: s.title,
      exercises: s.exercises.map(e => ({ description: e.description, type: e.type, distance: e.distance })),
    })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workout.name.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function WorkoutListPage() {
  const { workouts, deleteWorkout, sessions, addWorkout } = useWorkout();
  const importRef = useRef<HTMLInputElement>(null);

  const getSessionCount = (workoutId: string) => sessions.filter(s => s.workoutId === workoutId).length;
  const getAvgFeeling = (workoutId: string) => {
    const ws = sessions.filter(s => s.workoutId === workoutId && s.feeling);
    if (!ws.length) return null;
    return (ws.reduce((sum, s) => sum + (s.feeling ?? 0), 0) / ws.length).toFixed(1);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Supprimer "${name}" ?`)) deleteWorkout(id);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const id = addWorkout({
          name: (data.name ?? 'Importé') + ' (importé)',
          type: data.type ?? 'Mixte',
          sections: (Array.isArray(data.sections) ? data.sections : []).map((s: any, si: number) => ({
            id: `imp-s-${Date.now()}-${si}`,
            title: s.title ?? 'Section',
            exercises: (Array.isArray(s.exercises) ? s.exercises : []).map((e: any, ei: number) => ({
              id: `imp-e-${Date.now()}-${si}-${ei}`,
              description: e.description ?? '',
              type: e.type ?? 'fullbody',
              distance: e.distance ?? '100m',
            })),
          })),
        });
        alert(`"${data.name ?? 'Entraînement'}" importé avec succès !`);
      } catch { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalDistAll = workouts.reduce((sum, w) => sum + getTotalDistance(w.sections), 0);
  const avgFeelingAll = sessions.filter(s => s.feeling).length > 0
    ? (sessions.reduce((s, se) => s + (se.feeling ?? 0), 0) / sessions.filter(s => s.feeling).length).toFixed(1)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-blue-900 leading-tight">Mes Entraînements</h1>
          <p className="text-xs text-gray-500 mt-0.5">{workouts.length} séance{workouts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import JSON */}
          <button
            onClick={() => importRef.current?.click()}
            className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            title="Importer JSON"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Link to="/workouts/new"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow font-semibold text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Créer</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Waves className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="font-bold text-gray-600">Aucun entraînement</h2>
          <p className="text-gray-400 text-sm mt-1 mb-5">Créez votre première séance</p>
          <Link to="/workouts/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm">
            <Plus className="w-4 h-4" />Créer un entraînement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {workouts.map(workout => {
            const colors = WORKOUT_TYPE_COLORS[workout.type];
            const totalDist = getTotalDistance(workout.sections);
            const sessionCount = getSessionCount(workout.id);
            const avgF = getAvgFeeling(workout.id);

            return (
              <div key={workout.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`h-1 bg-gradient-to-r ${colors?.gradient ?? 'from-blue-400 to-blue-600'}`} />
                <div className="p-3 sm:p-4">
                  {/* Header */}
                  <div className="flex items-start gap-2 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors?.bg} ${colors?.text} ${colors?.border}`}>
                        {workout.type}
                      </span>
                      <h3 className="font-black text-gray-900 text-sm sm:text-base mt-1 leading-tight truncate">
                        {workout.name}
                      </h3>
                    </div>
                  </div>

                  {/* Sections preview */}
                  <div className="space-y-0.5 mb-3">
                    {workout.sections.slice(0, 2).map(section => (
                      <div key={section.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors?.dot ?? 'bg-blue-500'}`} />
                        <span className="font-medium text-gray-600 truncate">{section.title}</span>
                        <span className="text-gray-400 shrink-0">· {section.exercises.length} exo{section.exercises.length !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                    {workout.sections.length > 2 && (
                      <div className="text-xs text-gray-400 pl-3">+{workout.sections.length - 2} section(s)…</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 py-2 border-t border-b border-gray-100 mb-3">
                    <div className="flex-1 text-center">
                      <p className="text-sm font-black text-blue-700">{totalDist}m</p>
                      <p className="text-[10px] text-gray-400">Distance</p>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    <div className="flex-1 text-center">
                      <p className="text-sm font-black text-blue-700">{sessionCount}</p>
                      <p className="text-[10px] text-gray-400">Réalisés</p>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    <div className="flex-1 text-center">
                      {avgF ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <p className="text-sm font-black text-amber-500">{avgF}</p>
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        </div>
                      ) : <p className="text-sm font-black text-gray-300">—</p>}
                      <p className="text-[10px] text-gray-400">Ressenti</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Link to={`/workouts/${workout.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold">
                      <Eye className="w-3.5 h-3.5" />Voir
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </Link>
                    <Link to={`/workouts/new?copy=${workout.id}`}
                      className="p-1.5 text-teal-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Dupliquer">
                      <Copy className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => exportWorkoutJSON(workout)}
                      className="p-1.5 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Exporter JSON">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(workout.id, workout.name)}
                      className="p-1.5 text-red-200 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <Link to="/workouts/new"
            className="border-2 border-dashed border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group min-h-[160px]">
            <div className="bg-blue-100 group-hover:bg-blue-200 w-12 h-12 rounded-full flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-blue-600 text-sm">Nouveau</p>
              <p className="text-xs text-gray-400">Depuis la bibliothèque</p>
            </div>
          </Link>
        </div>
      )}

      {/* Global stats */}
      {workouts.length > 0 && (
        <div className="mt-5 bg-white rounded-2xl shadow-sm p-3.5 border border-blue-100">
          <div className="flex items-center gap-2 mb-2.5">
            <Dumbbell className="w-4 h-4 text-blue-600" />
            <h2 className="font-black text-blue-900 text-sm">Vue d'ensemble</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Séances', value: workouts.length, color: 'text-blue-700' },
              { label: 'Réalisées', value: sessions.length, color: 'text-green-700' },
              { label: 'Distance', value: `${totalDistAll}m`, color: 'text-cyan-700' },
              { label: 'Ressenti', value: avgFeelingAll ? `${avgFeelingAll}/5` : '—', color: 'text-amber-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-blue-50 rounded-xl p-2 text-center">
                <p className={`text-sm sm:text-base font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
