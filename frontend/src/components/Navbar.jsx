import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'view_kanban', label: 'Tracker', path: '/tracker' },
  { icon: 'forward_to_inbox', label: 'Sender', path: '/bulk-sender' },
  { icon: 'analytics', label: 'Analytics', path: '/analytics' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* SideNavBar (Desktop) */}
      <aside className="bg-surface-container w-[260px] h-screen hidden lg:flex flex-col sticky top-0 left-0 border-r border-outline-variant py-lg px-md z-50">
        <div className="mb-xl px-sm flex justify-between items-start">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">JobHunt Pro</h1>
            <p className="text-on-surface-variant font-label-md">Command Center</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-sm rounded-xl bg-surface-container-highest text-primary hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
        
        <nav className="flex-1 space-y-xs">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 active:scale-[0.98] font-body-md",
                location.pathname === item.path
                  ? "text-primary font-bold bg-surface-container-highest"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-xs">
          <button className="w-full bg-inverse-primary text-white py-sm rounded-lg font-bold mb-md hover:shadow-[0_0_12px_rgba(73,75,214,0.4)] transition-all flex items-center justify-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Job Entry
          </button>
          <a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface transition-all" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-body-md">Support</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface transition-all" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">Sign Out</span>
          </a>
        </div>
      </aside>

      {/* BottomNavBar (Mobile/Tablet) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-surface-container-high/80 backdrop-blur-xl border-t border-outline-variant shadow-[0_-4px_24px_rgba(0,0,0,0.2)] flex justify-around items-center h-20 px-2 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              "flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-3 py-2 rounded-2xl flex-1 max-w-[80px]",
              location.pathname === item.path
                ? "text-primary bg-primary/10 font-bold"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            )}
          >
            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            <span className="font-label-md text-[10px] mt-1">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
