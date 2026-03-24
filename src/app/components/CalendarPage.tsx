import { useState, useMemo, useRef } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, X, Star, Plus, Trash2, Edit3,
  CheckCircle, Download, ExternalLink, Link2, Upload, ChevronDown,
} from 'lucide-react';
import {
  useWorkout, CompletedSession, WORKOUT_TYPE_COLORS, WorkoutType, AppCalendar,
} from '../store/WorkoutContext';

// ─── ICS helpers ────────────────────────────────────────────────────────────
function toICSDate(d: string) { return d.replace(/-/g, ''); }

function generateICS(sessions: CompletedSession[], calName = 'SwimPlan 🏊'): string {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//SwimPlan//SwimPlan//FR', 'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH', `X-WR-CALNAME:${calName}`, 'X-WR-TIMEZONE:Europe/Paris',
  ];
  sessions.forEach(s => {
    const d = toICSDate(s.date);
    const desc = [
      `Type: ${s.workoutType}`,
      s.totalTime ? `Durée: ${s.totalTime}` : '',
      s.feeling ? `Ressenti: ${s.feeling}/5` : '',
      s.comments ? `Notes: ${s.comments}` : '',
    ].filter(Boolean).join('\\n');
    lines.push('BEGIN:VEVENT', `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${d}`,
      `SUMMARY:🏊 ${s.workoutName}`, `DESCRIPTION:${desc}`,
      `UID:swimplan-${s.id}@swimplan.app`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(sessions: CompletedSession[], filename = 'swimplan.ics') {
  const blob = new Blob([generateICS(sessions)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function googleCalendarUrl(session: CompletedSession): string {
  const d = toICSDate(session.date);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🏊 ${session.workoutName}`,
    dates: `${d}/${d}`,
    details: [`Type: ${session.workoutType}`, session.totalTime ? `Durée: ${session.totalTime}` : '', session.comments || ''].filter(Boolean).join('\n'),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// ─── Star rating ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly, size = 'md' }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean; size?: 'sm' | 'md';
}) {
  const [hovered, setHovered] = useState(0);
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)} onMouseLeave={() => setHovered(0)}
          disabled={readonly} className={`transition-transform ${!readonly ? 'hover:scale-110' : 'cursor-default'}`}>
          <Star className={`${cls} ${s <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

// ─── Calendar dot colors ──────────────────────────────────────────────────────
const PALETTE = ['#3b82f6','#22c55e','#f97316','#a855f7','#ef4444','#14b8a6','#6366f1','#f59e0b'];

// ─── Mobile calendar selector ─────────────────────────────────────────────────
function MobileCalendarSelector({
  calendars, onToggle, onAdd,
}: { calendars: AppCalendar[]; onToggle: (id: string) => void; onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = calendars.filter(c => c.visible);

  return (
    <div className="relative lg:hidden mb-2" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 shadow-sm"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-black text-blue-900">Calendriers</span>
          <div className="flex gap-1 overflow-hidden">
            {visible.slice(0, 4).map(c => (
              <span key={c.id} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
            ))}
            {visible.length === 0 && <span className="text-xs text-gray-400">Aucun sélectionné</span>}
          </div>
          <span className="text-xs text-gray-400 shrink-0">{visible.length}/{calendars.length}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-2 space-y-0.5">
            {calendars.map(cal => (
              <button
                key={cal.id}
                onClick={() => onToggle(cal.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${cal.visible ? 'border-transparent' : 'border-gray-300 bg-transparent'}`}
                  style={cal.visible ? { backgroundColor: cal.color, borderColor: cal.color } : undefined}>
                  {cal.visible && <span className="text-white text-[8px] font-black">✓</span>}
                </div>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cal.color }} />
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate block">{cal.name}</span>
                  {cal.source === 'imported' && <span className="text-[10px] text-gray-400">Importé</span>}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <button onClick={() => { onAdd(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-colors">
              <Plus className="w-3.5 h-3.5" />Ajouter un calendrier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────
function CalendarSidebar({
  calendars, onToggle, onAdd, onExport,
}: { calendars: AppCalendar[]; onToggle: (id: string) => void; onAdd: () => void; onExport: () => void }) {
  return (
    <div className="hidden lg:flex flex-col gap-3 w-52 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5">
          <p className="text-xs font-black text-white uppercase tracking-wide">Calendriers</p>
        </div>
        <div className="p-2 space-y-0.5">
          {calendars.map(cal => (
            <button
              key={cal.id}
              onClick={() => onToggle(cal.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors group text-left"
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${cal.visible ? 'border-transparent' : 'border-gray-300'}`}
                style={cal.visible ? { backgroundColor: cal.color, borderColor: cal.color } : undefined}>
                {cal.visible && <span className="text-white text-[8px] font-black">✓</span>}
              </div>
              <span className="w-2.5 h-2.5 rounded-full shrink-0 transition-all" style={{ backgroundColor: cal.color, opacity: cal.visible ? 1 : 0.3 }} />
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-medium block truncate ${cal.visible ? 'text-gray-800' : 'text-gray-400'}`}>{cal.name}</span>
                {cal.source === 'imported' && <span className="text-[9px] text-gray-400">Importé ·webcal</span>}
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 p-2">
          <button onClick={onAdd}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-colors">
            <Plus className="w-3.5 h-3.5" />Ajouter un calendrier
          </button>
        </div>
      </div>

      <button onClick={onExport}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-xs font-black shadow">
        <Link2 className="w-3.5 h-3.5" />Connecter / Exporter
      </button>
    </div>
  );
}

// ─── Add calendar modal ───────────────────────────────────────────────────────
function AddCalendarModal({
  onClose, onSave, importFile,
}: { onClose: () => void; onSave: (cal: { name: string; color: string; source: 'local' | 'imported'; url?: string }) => void; importFile: () => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [source, setSource] = useState<'local' | 'imported'>('local');
  const [url, setUrl] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-blue-900">Nouveau calendrier</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Equipe 2"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
            <select value={source} onChange={e => setSource(e.target.value as 'local' | 'imported')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="local">Local (créé dans l'app)</option>
              <option value="imported">Importé (URL WebCal / iCal)</option>
            </select>
          </div>
          {source === 'imported' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">URL WebCal / iCal</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="webcal://..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {/* Import ICS file */}
          <button onClick={importFile}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-blue-600 py-2 rounded-xl hover:bg-blue-50 transition-colors text-xs font-semibold">
            <Upload className="w-3.5 h-3.5" />Importer un fichier .ics
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">Annuler</button>
          <button onClick={() => { if (!name.trim()) return; onSave({ name: name.trim(), color, source, url: url || undefined }); }}
            disabled={!name.trim()}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-black text-sm shadow disabled:opacity-40">
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Export modal ─────────────────────────────────────────────────────────────
function ExportModal({ sessions, onClose }: { sessions: CompletedSession[]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const webcalUrl = 'webcal://swimplan.app/api/calendar/export.ics';
  const copyWebcal = () => {
    navigator.clipboard.writeText(webcalUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4 flex items-center justify-between">
          <div className="text-white">
            <p className="font-black text-lg">Calendrier externe</p>
            <p className="text-xs text-white/70">Synchronisez SwimPlan</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* iCloud */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center text-sm">📅</div>
              <div><p className="font-black text-sm text-gray-900">iCloud / Apple Calendar</p><p className="text-xs text-gray-500">Abonnement WebCal</p></div>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <code className="text-xs text-gray-700 flex-1 truncate">{webcalUrl}</code>
                <button onClick={copyWebcal} className={`text-xs font-semibold shrink-0 ${copied ? 'text-green-600' : 'text-blue-600 hover:text-blue-800'}`}>
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadICS(sessions)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 text-white py-2 rounded-xl text-xs font-semibold hover:bg-gray-900 transition-colors">
                  <Download className="w-3.5 h-3.5" />Télécharger .ics
                </button>
                <a href="webcal://swimplan.app/api/calendar/export.ics"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-100 text-blue-800 py-2 rounded-xl text-xs font-semibold hover:bg-blue-200 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />Ouvrir WebCal
                </a>
              </div>
            </div>
          </div>
          {/* Google */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-sm font-black">G</div>
              <div><p className="font-black text-sm text-gray-900">Google Calendar</p><p className="text-xs text-gray-500">Export ou ajout direct</p></div>
            </div>
            <div className="px-4 py-3 space-y-2">
              <button onClick={() => downloadICS(sessions, 'swimplan-google.ics')}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                <Download className="w-3.5 h-3.5" />Exporter toutes les sessions (.ics)
              </button>
              {sessions.slice(0, 3).map(s => (
                <a key={s.id} href={googleCalendarUrl(s)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl px-3 py-2 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${WORKOUT_TYPE_COLORS[s.workoutType]?.dot}`} />
                  <span className="text-xs text-gray-700 font-medium flex-1 truncate">{s.workoutName}</span>
                  <span className="text-xs text-gray-400 shrink-0">{s.date.split('-').reverse().join('/')}</span>
                  <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                </a>
              ))}
              {sessions.length > 3 && <p className="text-xs text-gray-400 text-center">… et {sessions.length - 3} autre(s)</p>}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-bold">Note :</span> La synchronisation automatique nécessite une connexion serveur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal types ──────────────────────────────────────────────────────────────
type ModalState = { mode: 'view'; date: Date } | { mode: 'add'; date: Date } | { mode: 'edit'; session: CompletedSession } | null;

// ─── Main ─────────────────────────────────────────────────────────────────────
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function CalendarPage() {
  const { sessions, workouts, calendars, addSession, updateSession, deleteSession, addCalendar, toggleCalendarVisibility } = useWorkout();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [modal, setModal] = useState<ModalState>(null);
  const [showExport, setShowExport] = useState(false);
  const [showAddCal, setShowAddCal] = useState(false);

  const icsImportRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formWorkoutId, setFormWorkoutId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formFeeling, setFormFeeling] = useState(3);
  const [formComments, setFormComments] = useState('');
  const [formCalendarId, setFormCalendarId] = useState('');

  // Visible calendars
  const visibleCalendarIds = useMemo(() => new Set(calendars.filter(c => c.visible).map(c => c.id)), [calendars]);

  // Only show sessions whose calendar is visible
  const filteredSessions = useMemo(
    () => sessions.filter(s => !s.calendarId || visibleCalendarIds.has(s.calendarId)),
    [sessions, visibleCalendarIds]
  );

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const getSessionsForDay = (day: Date) =>
    filteredSessions.filter(s => { try { return isSameDay(parseISO(s.date), day); } catch { return false; } });

  const monthSessions = filteredSessions.filter(s => {
    try { return isSameMonth(parseISO(s.date), currentMonth); } catch { return false; }
  });

  const avgFeeling = monthSessions.filter(s => s.feeling).length
    ? (monthSessions.reduce((acc, s) => acc + (s.feeling ?? 0), 0) / monthSessions.filter(s => s.feeling).length).toFixed(1)
    : null;

  const openAdd = (date: Date) => {
    setFormDate(format(date, 'yyyy-MM-dd'));
    setFormWorkoutId(workouts[0]?.id ?? '');
    setFormTime(''); setFormFeeling(3); setFormComments('');
    setFormCalendarId(calendars[0]?.id ?? '');
    setModal({ mode: 'add', date });
  };
  const openEdit = (session: CompletedSession) => {
    setFormDate(session.date); setFormWorkoutId(session.workoutId);
    setFormTime(session.totalTime ?? ''); setFormFeeling(session.feeling ?? 3);
    setFormComments(session.comments ?? ''); setFormCalendarId(session.calendarId ?? '');
    setModal({ mode: 'edit', session });
  };

  const handleSave = () => {
    const workout = workouts.find(w => w.id === formWorkoutId);
    if (!workout) return;
    const payload = {
      workoutId: workout.id, workoutName: workout.name, workoutType: workout.type,
      date: formDate, totalTime: formTime || undefined,
      feeling: formFeeling || undefined, comments: formComments || undefined,
      calendarId: formCalendarId || undefined,
    };
    if (modal?.mode === 'add') addSession(payload);
    else if (modal?.mode === 'edit') updateSession(modal.session.id, payload);
    setModal(null);
  };

  const handleDelete = (sessionId: string) => {
    if (window.confirm('Supprimer cette session ?')) { deleteSession(sessionId); setModal(null); }
  };

  const handleAddCalendar = (cal: { name: string; color: string; source: 'local' | 'imported'; url?: string }) => {
    addCalendar({ ...cal, visible: true });
    setShowAddCal(false);
  };

  const handleImportICS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Parse calendar name from ICS (basic)
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const nameMatch = text.match(/X-WR-CALNAME:([^\r\n]+)/);
      const calName = nameMatch ? nameMatch[1].replace(/🏊\s*/g, '').trim() : file.name.replace(/\.ics$/i, '');
      addCalendar({ name: calName || 'Importé', color: PALETTE[Math.floor(Math.random() * PALETTE.length)], source: 'imported', visible: true });
      alert(`Calendrier "${calName}" importé. Les événements externes ne sont pas encore synchronisés automatiquement.`);
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowAddCal(false);
  };

  const modalDate = modal?.mode === 'view' || modal?.mode === 'add' ? modal.date
    : modal?.mode === 'edit' ? parseISO(modal.session.date) : null;
  const viewSessions = modal?.mode === 'view' ? getSessionsForDay(modal.date) : [];

  const getCalendarColor = (calendarId?: string): string => {
    if (!calendarId) return '#3b82f6';
    return calendars.find(c => c.id === calendarId)?.color ?? '#3b82f6';
  };

  return (
    <div>
      {/* Page title — desktop */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-blue-900">Calendrier</h1>
          <p className="text-xs text-gray-500 mt-0.5">Suivi de vos sessions</p>
        </div>
        <button onClick={() => setShowExport(true)}
          className="hidden lg:flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-semibold shadow-sm">
          <Link2 className="w-4 h-4" />Exporter
        </button>
      </div>

      {/* Mobile calendar selector */}
      <MobileCalendarSelector calendars={calendars} onToggle={toggleCalendarVisibility} onAdd={() => setShowAddCal(true)} />

      {/* Layout: sidebar LEFT + calendar */}
      <div className="flex gap-4 items-start">
        {/* Desktop sidebar LEFT */}
        <CalendarSidebar
          calendars={calendars}
          onToggle={toggleCalendarVisibility}
          onAdd={() => setShowAddCal(true)}
          onExport={() => setShowExport(true)}
        />

        {/* Calendar + stats */}
        <div className="flex-1 min-w-0">
          {/* Calendar card — full bleed mobile */}
          <div className="bg-white sm:rounded-2xl sm:shadow-md sm:border sm:border-blue-100 overflow-hidden -mx-2 sm:mx-0">
            {/* Month nav */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 sm:px-5 py-3 flex items-center justify-between text-white">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-black text-base sm:text-lg capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
              {DAY_LABELS.map((l, i) => (
                <div key={i} className="py-1.5 text-center text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wide">{l}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const daySessions = getSessionsForDay(day);
                const inMonth = isSameMonth(day, currentMonth);
                const todayDay = isToday(day);
                return (
                  <button key={i}
                    onClick={() => daySessions.length > 0 ? setModal({ mode: 'view', date: day }) : openAdd(day)}
                    className={`min-h-[52px] sm:min-h-[68px] p-1 sm:p-1.5 border-b border-r border-gray-50 flex flex-col items-center gap-0.5 transition-colors
                      ${inMonth ? 'hover:bg-blue-50' : 'bg-gray-50/40 hover:bg-gray-100/50'}
                      ${todayDay ? 'bg-blue-50' : ''}`}>
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-black ${
                      todayDay ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-800' : 'text-gray-300'}`}>
                      {format(day, 'd')}
                    </div>
                    {daySessions.length > 0 && (
                      <div className="flex flex-col items-center gap-0.5 w-full px-0.5">
                        {daySessions.slice(0, 2).map(s => (
                          <div key={s.id} className="w-full h-1 sm:h-1.5 rounded-full"
                            style={{ backgroundColor: getCalendarColor(s.calendarId) }} />
                        ))}
                        {daySessions.length > 2 && <span className="text-[9px] text-gray-400 font-bold">+{daySessions.length - 2}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats — compact, below calendar */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Ce mois', value: monthSessions.length, sub: 'session' + (monthSessions.length !== 1 ? 's' : ''), color: 'text-blue-700' },
              { label: 'Ressenti', value: avgFeeling ? `${avgFeeling}/5` : '—', sub: 'moyen', color: 'text-amber-500' },
              { label: 'Total', value: sessions.length, sub: 'sessions', color: 'text-green-700' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-base font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Session modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3.5 flex items-center justify-between sticky top-0 rounded-t-2xl">
              <div className="text-white">
                <p className="text-[10px] text-white/70 uppercase tracking-wide font-semibold">
                  {modal.mode === 'view' ? 'Sessions du jour' : modal.mode === 'add' ? 'Nouvelle session' : 'Modifier'}
                </p>
                <p className="font-black text-base capitalize">
                  {modalDate ? format(modalDate, 'EEEE d MMMM', { locale: fr }) : ''}
                </p>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-white/20 rounded-lg text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4">
              {/* VIEW */}
              {modal.mode === 'view' && (
                <div className="space-y-3">
                  {viewSessions.map(session => {
                    const c = WORKOUT_TYPE_COLORS[session.workoutType];
                    const calColor = getCalendarColor(session.calendarId);
                    const calName = calendars.find(cl => cl.id === session.calendarId)?.name;
                    return (
                      <div key={session.id} className="border border-gray-100 rounded-xl p-3.5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c?.bg} ${c?.text} ${c?.border}`}>
                                {session.workoutType}
                              </span>
                              {calName && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: calColor }} />
                                  {calName}
                                </span>
                              )}
                            </div>
                            <p className="font-black text-gray-900 text-sm truncate">{session.workoutName}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => openEdit(session)} className="p-1.5 text-blue-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(session.id)} className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <a href={googleCalendarUrl(session)} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Google Calendar">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {session.totalTime && <span className="text-xs font-semibold text-blue-700">⏱ {session.totalTime}</span>}
                          {session.feeling && <StarRating value={session.feeling} readonly size="sm" />}
                        </div>
                        {session.comments && (
                          <p className="mt-2 text-xs text-gray-600 italic border-l-2 border-blue-200 pl-2.5">{session.comments}</p>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => openAdd(modal.date)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all text-sm">
                    <Plus className="w-4 h-4" />Ajouter une session
                  </button>
                </div>
              )}

              {/* ADD / EDIT FORM */}
              {(modal.mode === 'add' || modal.mode === 'edit') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Entraînement</label>
                    <select value={formWorkoutId} onChange={e => setFormWorkoutId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {workouts.length === 0 && <option value="">Aucun entraînement</option>}
                      {workouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Calendrier</label>
                    <select value={formCalendarId} onChange={e => setFormCalendarId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Aucun (session personnelle)</option>
                      {calendars.map(c => (
                        <option key={c.id} value={c.id}>{c.name}{c.source === 'imported' ? ' (importé)' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Temps total</label>
                    <input type="text" value={formTime} onChange={e => setFormTime(e.target.value)} placeholder="Ex: 1h20"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ressenti</label>
                    <StarRating value={formFeeling} onChange={setFormFeeling} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Commentaires</label>
                    <textarea value={formComments} onChange={e => setFormComments(e.target.value)}
                      placeholder="Notes, performances…" rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    {modal.mode === 'edit' && (
                      <button onClick={() => handleDelete(modal.session.id)}
                        className="p-2.5 border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setModal(null)}
                      className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 font-medium text-sm">Annuler</button>
                    <button onClick={handleSave} disabled={!formWorkoutId}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-black shadow text-sm disabled:opacity-40">
                      <CheckCircle className="w-4 h-4" />
                      {modal.mode === 'add' ? 'Enregistrer' : 'Mettre à jour'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add calendar modal */}
      {showAddCal && (
        <AddCalendarModal
          onClose={() => setShowAddCal(false)}
          onSave={handleAddCalendar}
          importFile={() => icsImportRef.current?.click()}
        />
      )}

      {/* Hidden ICS import input */}
      <input ref={icsImportRef} type="file" accept=".ics,.ical" onChange={handleImportICS} className="hidden" />

      {/* Export modal */}
      {showExport && <ExportModal sessions={filteredSessions} onClose={() => setShowExport(false)} />}
    </div>
  );
}