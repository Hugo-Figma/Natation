import { Outlet, NavLink } from 'react-router';
import { Waves, Plus, Calendar, Dumbbell } from 'lucide-react';
import { BottomTabBar } from './BottomTabBar';

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Top nav — desktop only */}
      <nav className="bg-blue-700 text-white shadow-xl print:hidden sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex items-center h-14 gap-2">
            <NavLink to="/" className="flex items-center gap-2 mr-6 shrink-0">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Waves className="w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight">SwimPlan</span>
            </NavLink>

            {/* Desktop nav links only */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors font-semibold ${
                    isActive ? 'bg-white/20' : 'hover:bg-white/10 text-white/80'
                  }`
                }
              >
                <Dumbbell className="w-4 h-4" />
                Entraînements
              </NavLink>
              <NavLink
                to="/workouts/new"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors font-semibold ${
                    isActive ? 'bg-white/20' : 'hover:bg-white/10 text-white/80'
                  }`
                }
              >
                <Plus className="w-4 h-4" />
                Créer
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors font-semibold ${
                    isActive ? 'bg-white/20' : 'hover:bg-white/10 text-white/80'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                Calendrier
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 pb-20 md:pb-8 print:p-0 print:max-w-none">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}
