import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart2, 
  User, 
  HeartHandshake, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Brain
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Empathy Chat', path: '/chat', icon: MessageSquare },
    { name: 'Mood Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Profile Settings', path: '/profile', icon: User },
    { name: 'Emergency Help', path: '/emergency', icon: HeartHandshake, highlight: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 dark:border-slate-800 h-full">
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-none">MindCareAI</h1>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Safe Space</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  item.highlight 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20' 
                    : isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Settings / User Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* User Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-md uppercase">
              {user?.display_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{user?.display_name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="text-xs font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:border-transparent transition-all"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 glass-panel bg-white/70">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-brand-500" />
            <h1 className="font-bold text-lg text-slate-800 dark:text-white">MindCareAI</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 absolute top-14 left-0 w-full z-50 animate-fadeIn">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    item.highlight 
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                      : isActive
                        ? 'bg-brand-500 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
