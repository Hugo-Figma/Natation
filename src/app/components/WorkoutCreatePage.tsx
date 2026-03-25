import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import {
  Plus, Trash2, X, Search, ArrowLeft, Save, ChevronUp,
  GripVertical, ArrowUp, ArrowDown, Upload,
} from 'lucide-react';
import {
  useWorkout, ExerciseType, WorkoutType, LibraryExercise, DistanceUnit,
  EXERCISE_TYPE_LABELS, EXERCISE_TYPE_COLORS, WORKOUT_TYPES,
} from '../store/WorkoutContext';

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const DND_BACKEND = isTouchDevice() ? TouchBackend : HTML5Backend;
const DND_OPTIONS = isTouchDevice() ? { enableMouseEvents: true } : {};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const EXERCISE_TYPES: ExerciseType[] = ['warmup', 'arms', 'legs', 'fins', 'intense', 'recovery', 'technical', 'fullbody'];
const DISTANCE_UNITS: { value: DistanceUnit; label: string }[] = [
  { value: 'm', label: 'm' },
  { value: 'km', label: 'km' },
  { value: 'min', label: 'min' },
  { value: 's', label: 's' },
  { value: 'reps', label: 'rép.' },
];
const DRAG_TYPE = 'EXERCISE_ITEM';

/** Appends unit suffix if the value is purely numeric (e.g. "100" → "100m"). Leaves "4×50", "3×30" untouched. */
function normalizeDistance(val: string, unit: DistanceUnit): string {
  const trimmed = val.trim();
  if (!trimmed) return trimmed;
  // purely numeric → add m
  if (/^\d+$/.test(trimmed)) {
    if (unit === 'km') return `${trimmed}km`;
    if (unit === 'min') return `${trimmed}min`;
    if (unit === 's') return `${trimmed}s`;
    if (unit === 'reps') return `${trimmed} rép.`;
    return `${trimmed}m`;
  }
  return trimmed;
}

interface ExerciseDraft {
  id: string;
  description: string;
  type: ExerciseType;
  distance: string;
  unit: DistanceUnit;
}

interface SectionDraft {
  id: string;
  title: string;
  comment: string;
  exercises: ExerciseDraft[];
  pickerOpen: boolean;
  pendingExercise: LibraryExercise | null;
  pendingDistance: string;
  pendingUnit: DistanceUnit;
}

interface DragItem { sectionId: string; index: number; }

function ExerciseTypeBadge({ type }: { type: ExerciseType }) {
  const color = EXERCISE_TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`font-semibold rounded-full px-2 py-0.5 text-[10px] shrink-0 ${color}`}>
      {EXERCISE_TYPE_LABELS[type]}
    </span>
  );
}

// ── Draggable exercise row ──────────────────────────────────────────────────
function DraggableExercise({
  exercise, sectionId, index, total, moveExercise, onRemove, onDistanceChange, onDistanceBlur, onUnitChange,
}: {
  exercise: ExerciseDraft;
  sectionId: string;
  index: number;
  total: number;
  moveExercise: (sectionId: string, from: number, to: number) => void;
  onRemove: () => void;
  onDistanceChange: (val: string) => void;
  onDistanceBlur: (val: string) => void;
  onUnitChange: (unit: DistanceUnit) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: DRAG_TYPE,
    item: { sectionId, index },
    collect: m => ({ isDragging: m.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: DRAG_TYPE,
    hover(item, monitor) {
      if (!ref.current || item.sectionId !== sectionId) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const rect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset?.y ?? 0) - rect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveExercise(sectionId, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  dragPreview(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative flex items-center gap-1.5 bg-gray-50 rounded-xl px-2 py-2 group transition-all ${
        isDragging ? 'opacity-30 scale-95' : ''
      } ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* Drag handle */}
      <div ref={drag} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none shrink-0 p-0.5">
        <GripVertical className="w-4 h-4" />
      </div>

      <ExerciseTypeBadge type={exercise.type} />
      <span className="flex-1 text-xs font-medium text-gray-800 min-w-0 truncate">{exercise.description}</span>

      <input
        type="text"
        value={exercise.distance}
        onChange={e => onDistanceChange(e.target.value)}
        onBlur={e => onDistanceBlur(e.target.value)}
        className="w-16 text-center text-[11px] font-black text-blue-700 border border-blue-200 rounded-lg px-1.5 py-1 outline-none focus:ring-2 focus:ring-blue-400 bg-white shrink-0"
        placeholder="100"
      />
      <select
        value={exercise.unit}
        onChange={e => onUnitChange(e.target.value as DistanceUnit)}
        className="w-16 text-center text-[10px] font-semibold text-blue-700 border border-blue-200 rounded-lg px-1.5 py-1 outline-none focus:ring-2 focus:ring-blue-400 bg-white shrink-0"
      >
        {DISTANCE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>

      {/* Move buttons — always visible on mobile, hover on desktop */}
      <div className="flex flex-col gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 shrink-0">
        <button onClick={() => index > 0 && moveExercise(sectionId, index, index - 1)}
          disabled={index === 0}
          className="p-0.5 text-gray-300 hover:text-blue-500 disabled:opacity-20 transition-colors">
          <ArrowUp className="w-3 h-3" />
        </button>
        <button onClick={() => index < total - 1 && moveExercise(sectionId, index, index + 1)}
          disabled={index === total - 1}
          className="p-0.5 text-gray-300 hover:text-blue-500 disabled:opacity-20 transition-colors">
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>

      <button onClick={onRemove}
        className="p-1 text-gray-200 hover:text-red-500 transition-colors shrink-0 sm:opacity-0 sm:group-hover:opacity-100">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
function WorkoutCreateInner() {
  const { exerciseLibrary, addWorkout, workouts } = useWorkout();
  const navigate = useNavigate();
  const location = useLocation();

  // Read ?copy=id
  const copyId = new URLSearchParams(location.search).get('copy');
  const copySource = copyId ? workouts.find(w => w.id === copyId) : null;

  const makeDefaultSections = useCallback((): SectionDraft[] => {
    if (copySource) {
      return copySource.sections.map(s => ({
        id: generateId(),
        title: s.title,
        comment: s.comment ?? '',
        exercises: s.exercises.map(e => ({ ...e, id: generateId(), unit: e.unit ?? 'm' })),
        pickerOpen: false,
        pendingExercise: null,
        pendingDistance: '',
        pendingUnit: 'm',
      }));
    }
    return [{
      id: generateId(),
      title: 'Échauffement',
      comment: '',
      exercises: [],
      pickerOpen: false,
      pendingExercise: null,
      pendingDistance: '',
      pendingUnit: 'm',
    }];
  }, [copySource]);

  const [name, setName] = useState(copySource ? `${copySource.name} (copie)` : '');
  const [type, setType] = useState<WorkoutType>(copySource?.type ?? 'Mixte');
  const [sections, setSections] = useState<SectionDraft[]>(makeDefaultSections);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExerciseType | 'all'>('all');
  const [customDesc, setCustomDesc] = useState('');
  const [customType, setCustomType] = useState<ExerciseType>('warmup');
  const [customDistance, setCustomDistance] = useState('');
  const [customUnit, setCustomUnit] = useState<DistanceUnit>('m');
  const [showCustom, setShowCustom] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean }>({});

  const importRef = useRef<HTMLInputElement>(null);

  const filteredExercises = exerciseLibrary.filter(ex => {
    const matchSearch = ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || ex.type === typeFilter;
    return matchSearch && matchType;
  });

  const updateSection = (sectionId: string, patch: Partial<SectionDraft>) =>
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...patch } : s));

  const togglePicker = (sectionId: string) => {
    setSections(prev => prev.map(s => ({
      ...s,
      pickerOpen: s.id === sectionId ? !s.pickerOpen : false,
      pendingExercise: null,
      pendingDistance: '',
      pendingUnit: 'm',
    })));
    setSearchQuery(''); setTypeFilter('all'); setShowCustom(false);
  };

  const addSection = () => setSections(prev => [...prev, {
    id: generateId(), title: 'Nouvelle section', comment: '', exercises: [],
    pickerOpen: false, pendingExercise: null, pendingDistance: '', pendingUnit: 'm',
  }]);

  const removeSection = (id: string) => setSections(prev => prev.filter(s => s.id !== id));

  const selectExercise = (sectionId: string, exercise: LibraryExercise) =>
    updateSection(sectionId, { pendingExercise: exercise, pendingDistance: '' });

  const confirmPending = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.pendingExercise) return;
    const fallbackByUnit = (unit: DistanceUnit) => {
      if (unit === 'km') return '0.1km';
      if (unit === 'min') return '1min';
      if (unit === 's') return '30s';
      if (unit === 'reps') return '1 rép.';
      return '50m';
    };
    const dist = normalizeDistance(section.pendingDistance, section.pendingUnit) || fallbackByUnit(section.pendingUnit);
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        exercises: [...s.exercises, {
          id: generateId(),
          description: s.pendingExercise!.description,
          type: s.pendingExercise!.type,
          distance: dist,
          unit: section.pendingUnit,
        }],
        pendingExercise: null,
        pendingDistance: '',
        pendingUnit: 'm',
      };
    }));
  };

  const cancelPending = (sectionId: string) =>
    updateSection(sectionId, { pendingExercise: null, pendingDistance: '', pendingUnit: 'm' });

  const removeExercise = (sectionId: string, exId: string) =>
    setSections(prev => prev.map(s => s.id !== sectionId ? s : { ...s, exercises: s.exercises.filter(e => e.id !== exId) }));

  const updateDistance = (sectionId: string, exId: string, distance: string) =>
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s, exercises: s.exercises.map(e => e.id === exId ? { ...e, distance } : e),
    }));

  const updateUnit = (sectionId: string, exId: string, unit: DistanceUnit) =>
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s, exercises: s.exercises.map(e => {
        if (e.id !== exId) return e;
        const stripped = e.distance.replace(/\s*(m|km|min|s|rép\.?)\s*$/i, '');
        const nextDistance = normalizeDistance(stripped || e.distance, unit) || stripped || e.distance;
        return { ...e, unit, distance: nextDistance };
      }),
    }));

  const blurDistance = (sectionId: string, exId: string, raw: string) => {
    const section = sections.find(s => s.id === sectionId);
    const unit = section?.exercises.find(e => e.id === exId)?.unit ?? 'm';
    const normalized = normalizeDistance(raw, unit);
    if (normalized !== raw) updateDistance(sectionId, exId, normalized);
  };

  const moveExercise = useCallback((sectionId: string, from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const exs = [...s.exercises];
      const [moved] = exs.splice(from, 1);
      exs.splice(to, 0, moved);
      return { ...s, exercises: exs };
    }));
  }, []);

  const moveSection = useCallback((from: number, to: number) => {
    setSections(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const addCustomExercise = (sectionId: string) => {
    if (!customDesc.trim()) return;
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s,
      exercises: [...s.exercises, {
        id: generateId(), description: customDesc.trim(),
        type: customType, distance: normalizeDistance(customDistance, customUnit) || '50m', unit: customUnit,
      }],
    }));
    setCustomDesc(''); setCustomDistance(''); setCustomUnit('m'); setShowCustom(false);
  };

  const handleSave = () => {
    if (!name.trim()) { setErrors({ name: true }); return; }
    addWorkout({
      name: name.trim(), type,
      sections: sections.map(s => ({ id: s.id, title: s.title, comment: s.comment, exercises: s.exercises })),
    });
    navigate('/');
  };

  // JSON Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.name) setName(data.name + ' (importé)');
        if (data.type) setType(data.type);
        if (Array.isArray(data.sections)) {
          setSections(data.sections.map((s: any) => ({
            id: generateId(),
            title: s.title ?? 'Section',
            comment: s.comment ?? '',
            pickerOpen: false, pendingExercise: null, pendingDistance: '',
            pendingUnit: 'm',
            exercises: (Array.isArray(s.exercises) ? s.exercises : []).map((e: any) => ({
              id: generateId(),
              description: e.description ?? '',
              type: e.type ?? 'fullbody',
              distance: e.distance ?? '100m',
              unit: e.unit ?? 'm',
            })),
          })));
        }
      } catch { alert('Fichier JSON invalide.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalExercises = sections.reduce((sum, s) => sum + s.exercises.length, 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors text-blue-700 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-black text-blue-900 leading-tight truncate">
            {copySource ? `Copie de « ${copySource.name} »` : 'Nouvel entraînement'}
          </h1>
        </div>
        {/* Import JSON */}
        <button
          onClick={() => importRef.current?.click()}
          className="shrink-0 p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Importer JSON"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow text-sm shrink-0"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Enregistrer</span>
        </button>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Nom *</label>
            <input
              type="text" value={name} onChange={e => { setName(e.target.value); setErrors({}); }}
              placeholder="Ex: Séance technique palmes"
              className={`w-full border rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">Requis</p>}
          </div>
          <div className="w-32 shrink-0">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value as WorkoutType)}
              className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            {/* Section header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2.5 flex items-center gap-2">
              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">
                {sectionIndex + 1}
              </span>
              <input
                type="text" value={section.title}
                onChange={e => updateSection(section.id, { title: e.target.value })}
                className="flex-1 bg-transparent text-white font-black text-sm outline-none placeholder-white/60 border-b border-white/30 focus:border-white pb-0.5 min-w-0"
                placeholder="Titre de la section"
              />
              {/* Section move arrows */}
              {sections.length > 1 && (
                <div className="flex gap-0.5 shrink-0">
                  <button
                    onClick={() => sectionIndex > 0 && moveSection(sectionIndex, sectionIndex - 1)}
                    disabled={sectionIndex === 0}
                    className="p-0.5 text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                    title="Monter la section"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => sectionIndex < sections.length - 1 && moveSection(sectionIndex, sectionIndex + 1)}
                    disabled={sectionIndex === sections.length - 1}
                    className="p-0.5 text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                    title="Descendre la section"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {sections.length > 1 && (
                <button onClick={() => removeSection(section.id)} className="text-white/60 hover:text-white p-0.5 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Exercises */}
            <div className="p-2 sm:p-3">
              <div className="mb-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Commentaire / temps estimé</label>
                <input
                  type="text"
                  value={section.comment}
                  onChange={e => updateSection(section.id, { comment: e.target.value })}
                  placeholder="Ex: 10 min souple, récupération 1 min…"
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              {section.exercises.length === 0 && !section.pickerOpen && (
                <p className="text-center text-gray-400 text-xs py-2">Aucun exercice</p>
              )}
              <div className="space-y-1.5 mb-2">
                {section.exercises.map((ex, idx) => (
                  <DraggableExercise
                    key={ex.id}
                    exercise={ex}
                    sectionId={section.id}
                    index={idx}
                    total={section.exercises.length}
                    moveExercise={moveExercise}
                    onRemove={() => removeExercise(section.id, ex.id)}
                    onDistanceChange={val => updateDistance(section.id, ex.id, val)}
                    onDistanceBlur={val => blurDistance(section.id, ex.id, val)}
                    onUnitChange={val => updateUnit(section.id, ex.id, val)}
                  />
                ))}
              </div>

              {/* Pending exercise → distance */}
              {section.pendingExercise && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-3 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <ExerciseTypeBadge type={section.pendingExercise.type} />
                    <span className="text-xs font-semibold text-gray-900 flex-1 min-w-0 truncate">
                      {section.pendingExercise.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-blue-700 shrink-0">Distance :</label>
                    <input
                      type="text" value={section.pendingDistance}
                      onChange={e => updateSection(section.id, { pendingDistance: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') confirmPending(section.id); if (e.key === 'Escape') cancelPending(section.id); }}
                      placeholder="ex: 100, 4×50…"
                      autoFocus
                      className="flex-1 border border-blue-300 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <select
                      value={section.pendingUnit}
                      onChange={e => updateSection(section.id, { pendingUnit: e.target.value as DistanceUnit })}
                      className="text-xs border border-blue-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {DISTANCE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <button onClick={() => confirmPending(section.id)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-blue-700 transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                      OK
                    </button>
                    <button onClick={() => cancelPending(section.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle picker */}
              {!section.pendingExercise && (
                <button onClick={() => togglePicker(section.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border-2 border-dashed border-blue-200 hover:border-blue-400">
                  {section.pickerOpen ? <><ChevronUp className="w-3.5 h-3.5" />Fermer</> : <><Plus className="w-3.5 h-3.5" />Ajouter un exercice</>}
                </button>
              )}

              {/* Exercise picker */}
              {section.pickerOpen && !section.pendingExercise && (
                <div className="mt-2 bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                  {/* Search */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher…"
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                  </div>
                  {/* Type filter */}
                  <div className="flex gap-1 mb-2 overflow-x-auto pb-1 scrollbar-thin">
                    <button onClick={() => setTypeFilter('all')}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 transition-colors ${typeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Tous
                    </button>
                    {EXERCISE_TYPES.map(t => (
                      <button key={t} onClick={() => setTypeFilter(t)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : `${EXERCISE_TYPE_COLORS[t]} border border-transparent hover:opacity-80`}`}>
                        {EXERCISE_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  {/* List */}
                  <div className="max-h-40 overflow-y-auto space-y-1 mb-2 scrollbar-thin">
                    {filteredExercises.length === 0 && <p className="text-center text-gray-400 text-xs py-3">Aucun résultat</p>}
                    {filteredExercises.map(ex => (
                      <button key={ex.id} onClick={() => selectExercise(section.id, ex)}
                        className="w-full flex items-center gap-2 bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-300 rounded-lg px-2.5 py-1.5 transition-all text-left">
                        <ExerciseTypeBadge type={ex.type} />
                        <span className="flex-1 text-xs text-gray-700 font-medium min-w-0 truncate">{ex.description}</span>
                        <Plus className="w-3 h-3 text-blue-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                  {/* Custom */}
                  <div className="border-t border-blue-200 pt-2">
                    <button onClick={() => setShowCustom(p => !p)}
                      className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800 mb-2">
                      <Plus className="w-3.5 h-3.5" />Exercice personnalisé
                    </button>
                    {showCustom && (
                      <div className="space-y-1.5">
                        <input type="text" value={customDesc} onChange={e => setCustomDesc(e.target.value)}
                          placeholder="Description…"
                          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                        <div className="flex gap-2">
                          <select value={customType} onChange={e => setCustomType(e.target.value as ExerciseType)}
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                            {EXERCISE_TYPES.map(t => <option key={t} value={t}>{EXERCISE_TYPE_LABELS[t]}</option>)}
                          </select>
                          <input type="text" value={customDistance} onChange={e => setCustomDistance(e.target.value)}
                            placeholder="100" className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                          <select value={customUnit} onChange={e => setCustomUnit(e.target.value as DistanceUnit)}
                            className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                            {DISTANCE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </select>
                          <button onClick={() => addCustomExercise(section.id)} disabled={!customDesc.trim()}
                            className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-black hover:bg-blue-700 disabled:opacity-40 shrink-0">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button onClick={addSection}
          className="w-full flex items-center justify-center gap-2 py-3 text-blue-600 font-semibold hover:bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all text-sm">
          <Plus className="w-4 h-4" />Ajouter une section
        </button>
      </div>

      {/* Bottom bar */}
      <div className="mt-5 flex items-center justify-between bg-blue-900 rounded-2xl p-3.5 text-white shadow-xl">
        <div className="min-w-0 flex-1">
          <p className="font-black truncate text-sm">{name || 'Nom de la séance…'}</p>
          <p className="text-blue-300 text-xs">
            {totalExercises} exo{totalExercises !== 1 ? 's' : ''} · {sections.length} section{sections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 ml-3 shrink-0">
          <button onClick={handleSave}
            className="flex items-center gap-1.5 bg-white text-blue-900 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors font-black shadow text-sm">
            <Save className="w-4 h-4" />Sauver
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkoutCreatePage() {
  return (
    <DndProvider backend={DND_BACKEND} options={DND_OPTIONS}>
      <WorkoutCreateInner />
    </DndProvider>
  );
}
