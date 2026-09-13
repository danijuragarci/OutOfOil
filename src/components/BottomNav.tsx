import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'metricas', label: 'Métricas', icon: 'speed' },
    { id: 'repostar', label: 'Repostar', icon: 'local_gas_station' },
    { id: 'precios', label: 'Precios', icon: 'pin_drop' },
    { id: 'taller', label: 'Taller', icon: 'build' },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#faf9fe]/90 dark:bg-[#121318]/90 backdrop-blur-xl border-t border-black/[0.05] dark:border-white/[0.06] shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-btn-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[48px] py-1 transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#0058bc] dark:text-[#60a5fa] font-semibold'
                  : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f] dark:hover:text-[#f2f3f8]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] transition-transform ${
                  isActive ? 'scale-105 font-bold' : ''
                }`}
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 600" }
                    : { fontVariationSettings: "'FILL' 0, 'wght' 400" }
                }
              >
                {item.icon}
              </span>
              <span
                className={`text-[11px] leading-tight tracking-tight mt-0.5 ${
                  isActive ? 'font-semibold text-[#0058bc] dark:text-[#60a5fa]' : 'font-normal'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
