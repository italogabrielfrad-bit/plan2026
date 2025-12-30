
import React from 'react';
import { Home, Wallet, Target, ChartBar, LogOut, Settings, Calendar } from 'lucide-react';
import { Tab } from './BottomNav';

interface SideNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export const SideNav = ({ activeTab, onTabChange }: SideNavProps) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Dashboard' },
        { id: 'wallet', icon: Wallet, label: 'Carteira' },
        { id: 'goals', icon: Target, label: 'Metas' },
        { id: 'reports', icon: ChartBar, label: 'Estratégia' },
        { id: 'fixed', icon: Calendar, label: 'Custos Fixos' },
        { id: 'setup', icon: Settings, label: 'Configuração' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-white/10 p-6 z-50">
            <div className="mb-10 px-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                    ANTIGRAVITY
                </h1>
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Stealth Mode</span>
            </div>

            <nav className="flex-1 space-y-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as Tab)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]" />}
                        </button>
                    )
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                        AG
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Operador</span>
                        <span className="text-[9px] text-slate-500">Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
