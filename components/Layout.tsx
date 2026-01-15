
import React from 'react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  const navItems = [
    { id: AppRoute.HOME, icon: '🏠', label: 'Início' },
    { id: AppRoute.LESSONS, icon: '📚', label: 'Lições' },
    { id: AppRoute.FLASHCARDS, icon: '🃏', label: 'Cards' },
    { id: AppRoute.TUTOR, icon: '✨', label: 'Sensei AI' },
    { id: AppRoute.PROGRESS, icon: '📈', label: 'Progresso' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white overflow-x-hidden">
      {/* Star Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-60 left-1/4 w-1 h-1 bg-yellow-200 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
      </div>

      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(AppRoute.HOME)}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
            ⭐
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Japostar
          </h1>
        </div>
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-2 rounded-lg transition-all ${
                activeRoute === item.id 
                ? 'bg-slate-800 text-indigo-400' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden sticky bottom-0 z-50 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 flex justify-around items-center p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeRoute === item.id ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] uppercase tracking-tighter font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
