import React from 'react';
import { BRAND_LOGO_URL } from '../initialData';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  vehicleName: string;
  onOpenProfile: () => void;
  hasUnsavedBackup?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  vehicleName,
  onOpenProfile,
  hasUnsavedBackup = true,
}) => {
  const getSubTitle = () => {
    switch (currentTab) {
      case 'repostar':
        return 'Repostar Combustible';
      case 'precios':
        return 'Precios Gasolineras';
      case 'taller':
        return 'Taller Mantenimiento';
      case 'metricas':
      default:
        return null;
    }
  };

  const subTitle = getSubTitle();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[#faf9fe]/85 dark:bg-[#121318]/85 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.06] shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & App / Model Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={BRAND_LOGO_URL}
            alt="Out of Oil Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
          />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[18px] text-[#1a1b1f] dark:text-[#f2f3f8] tracking-tight leading-none">
                OOO
              </span>
              <span className="text-[11px] font-semibold text-[#fe9400] dark:text-[#f59e0b] bg-[#fe9400]/12 dark:bg-[#fe9400]/25 px-1.5 py-0.5 rounded-full leading-none">
                CRDi
              </span>
            </div>

            <div className="flex items-center gap-1 text-[12px] text-[#717786] dark:text-[#a2a7b7] min-w-0 mt-0.5">
              <span className="truncate font-medium text-[#414755] dark:text-[#c1c6d7]">
                {vehicleName}
              </span>
              {subTitle && (
                <>
                  <span className="text-[#c1c6d7] dark:text-[#4b5563] text-[10px]">•</span>
                  <span className="text-[#006b27] dark:text-[#34d399] font-semibold truncate">
                    {subTitle}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: User Profile Avatar with Warning Badge */}
        <button
          onClick={onOpenProfile}
          aria-label="Perfil y Copias de Seguridad"
          id="profile-header-btn"
          className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-[#0058bc] flex items-center justify-center shadow-sm text-white">
            <span className="material-symbols-outlined text-[19px]">person</span>
          </div>
          {hasUnsavedBackup && (
            <span
              title="Copia de seguridad pendiente"
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#fe9400] ring-2 ring-[#faf9fe] dark:ring-[#121318] animate-pulse"
            />
          )}
        </button>
      </div>
    </header>
  );
};
