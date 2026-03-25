import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft, Printer, CheckCircle, Star, X, Trash2,
  MoreVertical, Download, Copy, FileText,
} from 'lucide-react';
import { createTypstCompiler } from '@myriaddreamin/typst.ts';
import { CompileFormatEnum } from '@myriaddreamin/typst.ts/compiler';
import typstTemplate from '../../typst/workout-template.typ?raw';
import { useWorkout, WORKOUT_TYPE_COLORS, WorkoutType, Workout, sectionsToMeters } from '../store/WorkoutContext';
import { SwimWorkoutSheet } from './SwimWorkoutSheet';

let typstCompilerPromise: Promise<ReturnType<typeof createTypstCompiler>> | null = null;

const getTypstCompiler = () => {
  if (!typstCompilerPromise) {
    const wasmUrl = new URL(
      '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
      import.meta.url
    );

    typstCompilerPromise = (async () => {
      const compiler = createTypstCompiler();
      await compiler.init({
        getModule: () => fetch(wasmUrl).then(res => res.arrayBuffer()),
      });
      return compiler;
    })();
  }
  return typstCompilerPromise;
};

const escapeTypstString = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

const buildTypstWorkoutPayload = (workout: Workout) => {
  const sections = workout.sections.map(section => {
    const exercises = section.exercises
      .map(ex => `(
        description: "${escapeTypstString(ex.description)}",
        distance: "${escapeTypstString(ex.distance)}",
        type: "${escapeTypstString(ex.type)}",
        unit: "${escapeTypstString(ex.unit ?? '')}",
      )`)
      .join(',');

    return `(
      title: "${escapeTypstString(section.title)}",
      comment: "${escapeTypstString(section.comment ?? '')}",
      exercises: (${exercises})
    )`;
  }).join(',');

  return `(
    name: "${escapeTypstString(workout.name)}",
    type: "${escapeTypstString(workout.type)}",
    created-at: "${escapeTypstString(workout.createdAt ?? '')}",
    total-distance: ${sectionsToMeters(workout.sections)},
    sections: (${sections})
  )`;
};

async function generateWorkoutPdf(workout: Workout) {
  const compiler = await getTypstCompiler();
  await compiler.reset();

  compiler.addSource('/workout-template.typ', typstTemplate);
  const mainSource = `
#import "/workout-template.typ": render-workout
#show: render-workout(${buildTypstWorkoutPayload(workout)})
  `;
  compiler.addSource('/main.typ', mainSource);

  const result = await compiler.compile({
    mainFilePath: '/main.typ',
    format: CompileFormatEnum.pdf,
  });

  if (!result.result) {
    const diagnostics = result.diagnostics
      ?.map(d => (typeof d === 'string' ? d : JSON.stringify(d)))
      .join('\n');
    throw new Error(`Typst compilation failed${diagnostics ? `:\n${diagnostics}` : ''}`);
  }

  return result.result;
}

async function exportWorkoutPdf(workout: Workout) {
  const pdfBytes = await generateWorkoutPdf(workout);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    const safeName = workout.name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
    a.download = `${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`w-7 h-7 ${star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

function exportWorkoutJSON(workout: ReturnType<typeof useWorkout>['workouts'][0]) {
  const data = {
    name: workout.name,
    type: workout.type,
    sections: workout.sections.map(s => ({
      title: s.title,
      comment: s.comment,
      exercises: s.exercises.map(e => ({
        description: e.description,
        type: e.type,
        distance: e.distance,
        unit: e.unit,
      })),
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

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts, addSession, deleteWorkout, sessions } = useWorkout();

  const workout = workouts.find(w => w.id === id);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logTime, setLogTime] = useState('');
  const [logFeeling, setLogFeeling] = useState(3);
  const [logComments, setLogComments] = useState('');

  // Actions dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (!workout) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Entraînement introuvable.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">← Retour</Link>
      </div>
    );
  }

  const colors = WORKOUT_TYPE_COLORS[workout.type as WorkoutType];

  const workoutSheetData = {
    title: workout.name.toUpperCase(),
    objective: workout.type,
    sections: workout.sections.map(s => ({
      title: s.title,
      comment: s.comment,
      exercises: s.exercises.map(e => ({ distance: e.distance, type: e.type, description: e.description, unit: e.unit })),
    })),
  };

  const handleLogSubmit = () => {
    addSession({
      workoutId: workout.id, workoutName: workout.name, workoutType: workout.type,
      date: logDate, totalTime: logTime || undefined,
      feeling: logFeeling || undefined, comments: logComments || undefined,
    });
    setShowLogModal(false);
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogTime(''); setLogFeeling(3); setLogComments('');
  };

  const handleDelete = () => {
    deleteWorkout(workout.id);
    navigate('/');
  };

  const workoutSessions = sessions.filter(s => s.workoutId === workout.id);

  return (
    <div>
      {/* ── Top action bar ── */}
      <div className="print:hidden mb-3">
        <div className="flex items-center gap-2">
          {/* Back */}
          <Link
            to="/"
            className="shrink-0 flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </Link>

          {/* Title + badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
            <div className={`h-4 w-1 rounded-full bg-gradient-to-b ${colors?.gradient} shrink-0`} />
            <h1 className="font-black text-sm sm:text-base text-blue-900 truncate leading-tight">{workout.name}</h1>
            <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${colors?.bg} ${colors?.text} ${colors?.border}`}>
              {workout.type}
            </span>
          </div>

          {/* Primary action */}
          <button
            onClick={() => setShowLogModal(true)}
            className="shrink-0 flex items-center gap-1.5 bg-green-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow text-xs sm:text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Réalisé</span>
          </button>

          {/* ... menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
                <button
                  onClick={() => { window.print(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Printer className="w-4 h-4 text-blue-500" />
                  Imprimer
                </button>
                <button
                  onClick={async () => {
                    setExportingPdf(true);
                    try {
                      await exportWorkoutPdf(workout);
                    } catch (err) {
                      console.error(err);
                      const message = err instanceof Error ? err.message : String(err);
                      alert(`Impossible de générer le PDF : ${message}`);
                    } finally {
                      setExportingPdf(false);
                      setMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={exportingPdf}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  {exportingPdf ? 'Export PDF…' : 'Exporter PDF'}
                </button>
                <button
                  onClick={() => { exportWorkoutJSON(workout); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  Exporter JSON
                </button>
                <Link
                  to={`/workouts/new?copy=${workout.id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <Copy className="w-4 h-4 text-teal-500" />
                  Dupliquer
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => { setShowDeleteConfirm(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer…
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Session history pills */}
        {workoutSessions.length > 0 && (
          <div className="mt-2.5 bg-white rounded-xl border border-blue-100 shadow-sm p-2.5">
            <p className="text-[10px] font-black text-blue-900 uppercase tracking-wide mb-1.5">
              {workoutSessions.length} session{workoutSessions.length !== 1 ? 's' : ''} réalisée{workoutSessions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-1">
              {workoutSessions.map(s => (
                <div key={s.id} className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-2 py-1 text-[10px]">
                  <span className="text-blue-700 font-semibold">{s.date.split('-').reverse().join('/')}</span>
                  {s.feeling && (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: s.feeling }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  )}
                  {s.totalTime && <span className="text-gray-400">{s.totalTime}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Workout sheet — full bleed on mobile ── */}
      <div className="-mx-2 sm:mx-0">
        <SwimWorkoutSheet workout={workoutSheetData} />
      </div>

      {/* ── Log session modal ── */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-5 pb-8 sm:pb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-blue-900">Enregistrer la session</h2>
              <button onClick={() => setShowLogModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Temps total</label>
                <input type="text" value={logTime} onChange={e => setLogTime(e.target.value)} placeholder="Ex: 1h20"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ressenti</label>
                <StarRating value={logFeeling} onChange={setLogFeeling} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Commentaires</label>
                <textarea value={logComments} onChange={e => setLogComments(e.target.value)}
                  placeholder="Notes, performances, observations…" rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowLogModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                Annuler
              </button>
              <button onClick={handleLogSubmit}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-black shadow text-sm">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-black text-gray-900">Supprimer l'entraînement</h2>
                <p className="text-xs text-gray-500">Cette action est irréversible</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-800 font-medium">"{workout.name}"</p>
              {workoutSessions.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ {workoutSessions.length} session{workoutSessions.length > 1 ? 's' : ''} réalisée{workoutSessions.length > 1 ? 's' : ''} seront conservées dans le calendrier.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition-colors font-black shadow text-sm">
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
