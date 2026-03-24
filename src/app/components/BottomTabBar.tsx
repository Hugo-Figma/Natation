import { NavLink } from 'react-router';
import { Dumbbell, Plus, Calendar } from 'lucide-react';

const tabs = [
  { to: '/', end: true, icon: Dumbbell, label: 'Séances' },
  { to: '/workouts/new', end: false, icon: Plus, label: 'Créer' },
  { to: '/calendar', end: false, icon: Calendar, label: 'Calendrier' },
];

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden print:hidden">
      <div className="flex items-stretch h-16">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area spacer for phones with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
