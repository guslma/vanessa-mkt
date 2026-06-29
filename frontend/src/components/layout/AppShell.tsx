import { LayoutDashboard, KanbanSquare, ListChecks, CalendarDays, Building2, Users, LogOut, Moon, Sun } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/', label: 'Resumo', Icon: LayoutDashboard },
  { to: '/quadro', label: 'Quadro', Icon: KanbanSquare },
  { to: '/tarefas', label: 'Tarefas', Icon: ListChecks },
  { to: '/calendario', label: 'Calendário', Icon: CalendarDays },
  { to: '/empreendimentos', label: 'Empreend.', Icon: Building2 },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const TODAY_LABEL = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: '2-digit', month: 'long',
}).format(new Date());

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} className={className}>
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navItems = user?.role === 'admin' ? [...NAV_ITEMS, { to: '/usuarios', label: 'Usuários', Icon: Users }] : NAV_ITEMS;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 md:flex-row">
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-slate-200 md:bg-white dark:md:border-slate-700 dark:md:bg-slate-800">
        <div className="flex items-center justify-center px-3 py-4">
          <img src="/icons/MKT.png" alt="Vanessa MKT" className="w-full" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</p>
            <ThemeToggle className="text-slate-400 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-400" />
          </div>
          <button onClick={logout} className="mt-1 flex items-center gap-1 text-xs text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-400">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-slate-700 dark:bg-slate-800 md:hidden">
        <div className="flex items-center gap-2.5">
          <img src="/icons/MKT.png" alt="Vanessa MKT" className="h-9 w-auto" />
          <div>
            <p className="text-xs text-slate-400 capitalize dark:text-slate-500">{TODAY_LABEL}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{greeting()}, {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="text-slate-500 dark:text-slate-400" />
          <button onClick={logout} title="Sair" className="text-slate-500 dark:text-slate-400">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <div className="mb-5 hidden md:block">
            <p className="text-sm text-slate-400 capitalize dark:text-slate-500">{TODAY_LABEL}</p>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-800 md:hidden">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] ${
                isActive ? 'text-brand-700 font-semibold dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
