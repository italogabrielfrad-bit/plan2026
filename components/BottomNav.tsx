
import React from 'react';
import { Home, Wallet, Target, ChartBar, Settings, Calendar } from 'lucide-react';

export type Tab = 'home' | 'wallet' | 'goals' | 'reports' | 'fixed' | 'setup' | 'onboarding';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'wallet', icon: Wallet, label: 'Carteira' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'reports', icon: ChartBar, label: 'Relatórios' },
    { id: 'fixed', icon: Calendar, label: 'Fixos' },
    { id: 'setup', icon: Settings, label: 'Config' },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-24 md:hidden" />

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-6 left-4 right-4 h-20 glass rounded-[2.5rem] border-t border-white/10 flex items-center justify-around z-50 md:hidden shadow-2xl shadow-black/50 backdrop-blur-xl bg-slate-950/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as Tab)}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${isActive ? 'bg-white/10 text-cyan-400 -translate-y-2 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
              <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 transition-all ${isActive ? 'opacity-100 translate-y-0 text-cyan-400' : 'opacity-0 translate-y-2 absolute'}`}>
                {isActive ? tab.label : ''}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
