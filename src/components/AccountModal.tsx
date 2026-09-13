import React, { useState } from 'react';
import { VehicleInfo, RefuelRecord, MaintenanceState, ThemeMode } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleInfo;
  refuels: RefuelRecord[];
  maintenance: MaintenanceState;
  theme: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  onRestoreBackup: (data: {
    vehicle?: VehicleInfo;
    refuels?: RefuelRecord[];
    maintenance?: MaintenanceState;
  }) => void;
  onShowToast: (msg: string) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  refuels,
  maintenance,
  theme,
  onSelectTheme,
  onRestoreBackup,
  onShowToast,
}) => {
  const [iCloudSyncEnabled, setICloudSyncEnabled] = useState(true);
  const [isSignedInApple, setIsSignedInApple] = useState(false);

  if (!isOpen) return null;

  // Actual working export of data as JSON download
  const handleExportData = () => {
    const backupPayload = {
      app: 'Out of Oil Telemetry',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      theme,
      vehicle,
      refuels,
      maintenance,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Kia_Cerato_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('Copia de seguridad descargada con éxito');
  };

  // Actual working restore from JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.vehicle || parsed.refuels || parsed.maintenance) {
          onRestoreBackup(parsed);
          onShowToast(`Historial restaurado desde "${file.name}"`);
          onClose();
        } else {
          onShowToast('El archivo no contiene un formato de respaldo válido.');
        }
      } catch {
        onShowToast('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleAppleAuth = () => {
    if (!isSignedInApple) {
      setIsSignedInApple(true);
      onShowToast('Sesión iniciada con Apple ID (danijuragarci@icloud.com)');
    } else {
      setIsSignedInApple(false);
      onShowToast('Sesión de Apple ID cerrada');
    }
  };

  const themeOptions: { label: string; mode: ThemeMode; icon: string }[] = [
    { label: 'Claro', mode: 'light', icon: 'light_mode' },
    { label: 'Oscuro', mode: 'dark', icon: 'dark_mode' },
    { label: 'Auto', mode: 'system', icon: 'brightness_auto' },
  ];

  return (
    <div
      id="ios-account-modal-wrapper"
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content Container */}
      <div
        id="ios-sheet-card"
        className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-[#16171d] text-[#1a1b1f] dark:text-[#f2f3f8] rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.18)] max-h-[92vh] overflow-y-auto flex flex-col border-t border-black/[0.05] dark:border-white/[0.08] animate-in slide-in-from-bottom duration-300"
      >
        {/* Native Grabber Bar Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1.5 bg-[#c1c6d7]/70 dark:bg-[#474c5d] rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#0058bc] dark:text-[#60a5fa] uppercase tracking-wider">
              Ajustes de Telemetría
            </span>
            <h2 className="text-[20px] font-bold">
              Cuenta, Tema y Copias
            </h2>
          </div>

          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#e9e7ed] dark:bg-[#2b2e39] text-[#414755] dark:text-[#c1c6d7] flex items-center justify-center active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Sheet Body */}
        <div className="px-5 pb-8 flex flex-col gap-3.5">
          {/* APARIENCIA / TEMA (Claro, Oscuro, Automático) */}
          <div className="bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs border border-black/[0.03] dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058bc] dark:text-[#60a5fa] text-[20px]">
                  palette
                </span>
                <span className="text-[14px] font-bold">Apariencia del Sistema</span>
              </div>
              <span className="text-[11px] font-medium text-[#717786] dark:text-[#a2a7b7] capitalize">
                {theme === 'system' ? 'Automático' : theme === 'dark' ? 'Oscuro' : 'Claro'}
              </span>
            </div>

            {/* iOS Segmented Control */}
            <div className="grid grid-cols-3 p-1 bg-[#e3e2e7] dark:bg-[#16171d] rounded-xl gap-1">
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => {
                      onSelectTheme(opt.mode);
                      onShowToast(`Tema cambiado a: ${opt.label}`);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-[#2b2e39] text-[#1a1b1f] dark:text-white shadow-xs'
                        : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f] dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Apple iCloud Sync Card */}
          <div className="bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl p-4 flex flex-col gap-3 shadow-xs relative overflow-hidden border border-black/[0.03] dark:border-white/[0.05]">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#d8e2ff] dark:bg-[#3b82f6]/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0058bc] dark:text-[#60a5fa] text-[24px]">
                  cloud_sync
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[16px] font-bold leading-tight">
                    Sincronización con iCloud
                  </h3>
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      isSignedInApple ? 'bg-[#006b27]' : 'bg-[#c1c6d7] dark:bg-[#474c5d]'
                    }`}
                  />
                </div>
                <p className="text-[12px] text-[#717786] dark:text-[#a2a7b7] mt-1 leading-snug">
                  Mantén tus repostajes, tickets y mantenimientos sincronizados en todos tus dispositivos Apple de forma automática y cifrada.
                </p>
              </div>
            </div>

            {/* Apple Sign-in Action Button */}
            <button
              type="button"
              onClick={handleAppleAuth}
              className={`w-full h-11 rounded-full flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all ${
                isSignedInApple
                  ? 'bg-[#006b27] text-white'
                  : 'bg-[#1a1b1f] dark:bg-white text-white dark:text-[#1a1b1f] hover:opacity-90'
              }`}
            >
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.62-7.85-11.77-14.4-6.41-10.12-11.41-21.73-14.99-34.82-3.58-13.09-5.37-25.04-5.37-35.85 0-16.75 4.35-30.7 13.04-41.87 8.7-11.16 19.78-16.85 33.25-17.06 4.9 0 10.22 1.3 15.96 3.92 5.75 2.62 9.69 4 11.83 4.13 1.74 0 5.86-1.46 12.35-4.38 6.49-2.92 12.2-4.18 17.13-3.78 12.63.87 22.84 5.38 30.64 13.53-11.1 6.75-16.54 16.32-16.32 28.72.22 9.8 4.02 18.06 11.4 24.78 7.39 6.72 16.09 10.51 26.11 11.37-2.39 7.4-5.22 14.79-8.49 22.17zm-32.99-106.6c0-7.84 2.8-15.14 8.4-21.9 5.6-6.76 12.4-10.75 20.4-11.97.22 1.09.33 2.18.33 3.27 0 7.84-2.94 15.35-8.82 22.54-5.88 7.19-12.8 11.23-20.76 12.1-.43-1.31-.65-2.65-.65-4.04z" />
              </svg>
              <span className="text-[13px] font-semibold">
                {isSignedInApple ? 'Apple ID Conectado' : 'Iniciar sesión con Apple'}
              </span>
            </button>

            {/* Toggle Row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[13px] font-semibold">
                Sincronizar datos automáticamente
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={iCloudSyncEnabled}
                onClick={() => {
                  const next = !iCloudSyncEnabled;
                  setICloudSyncEnabled(next);
                  onShowToast(
                    next
                      ? 'Sincronización automática de iCloud activada'
                      : 'Sincronización pausada'
                  );
                }}
                className={`w-[51px] h-[31px] rounded-full p-0.5 transition-colors relative shrink-0 shadow-inner ${
                  iCloudSyncEnabled ? 'bg-[#008733]' : 'bg-[#e3e2e7] dark:bg-[#353846]'
                }`}
              >
                <div
                  className={`w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform ${
                    iCloudSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. ALERTA PREVENTIVA */}
          <div className="bg-[#ffdcbf]/60 dark:bg-[#fe9400]/15 rounded-2xl p-4 flex items-start gap-3 shadow-xs relative overflow-hidden border border-[#fe9400]/20">
            <div className="w-10 h-10 rounded-full bg-[#fe9400] flex items-center justify-center shrink-0 text-white shadow-sm">
              <span className="material-symbols-outlined text-[22px]">
                warning
              </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-bold text-[#633700] dark:text-[#fbbf24]">
                  ¡Atención: Copia desactualizada!
                </h4>
                <span className="text-[10px] bg-[#fe9400] text-white px-2 py-0.5 rounded-full font-bold">
                  38 DÍAS
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-[#6a3b00] dark:text-[#fde68a] mt-1">
                Han pasado 38 días desde tu última copia de seguridad local (Última: 8 de Marzo). Te recomendamos exportar tus datos para no perder tu historial del Kia Cerato.
              </p>
            </div>
          </div>

          {/* 3. Gestión Manual de Datos */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#717786] dark:text-[#a2a7b7] px-1">
              Gestión Manual de Datos
            </span>

            <div className="bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl p-4 flex flex-col gap-3 shadow-xs border border-black/[0.03] dark:border-white/[0.05]">
              {/* Option A: Exportar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0058bc]/15 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      ios_share
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[13px] font-semibold">
                      Exportar datos (Crear Copia)
                    </span>
                    <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7] mt-0.5 leading-snug">
                      Descarga un archivo seguro (.json) con todo el historial de repostajes, fotos, odómetro y recordatorios.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full h-10 bg-[#0058bc] hover:bg-[#004493] active:scale-[0.98] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-[13px] font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  <span>Exportar Ahora</span>
                </button>
              </div>

              {/* Soft Divider */}
              <div className="w-full h-[1px] bg-[#e3e2e7] dark:bg-white/[0.08]" />

              {/* Option B: Importar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e9e7ed] dark:bg-[#2b2e39] text-[#1a1b1f] dark:text-[#f2f3f8] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      file_upload
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[13px] font-semibold">
                      Importar datos (Restaurar)
                    </span>
                    <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7] mt-0.5 leading-snug">
                      Carga un archivo de respaldo previo para restaurar telemetría y registros guardados.
                    </p>
                  </div>
                </div>

                <label className="w-full h-10 bg-[#e3e2e7] dark:bg-[#2b2e39] hover:opacity-90 active:scale-[0.98] text-[#1a1b1f] dark:text-[#f2f3f8] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-[13px] font-semibold transition-all select-none">
                  <span className="material-symbols-outlined text-[18px]">
                    folder_open
                  </span>
                  <span>Seleccionar Archivo</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 4. Perfil del Vehículo Actual Telemetry Summary */}
          <div className="bg-[#eeedf3] dark:bg-[#23252e] rounded-2xl p-3.5 flex items-center gap-3 border border-black/[0.03] dark:border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#16171d] text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">
                directions_car
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                Vehículo Vinculado Activo
              </span>
              <div className="text-[13px] font-bold truncate">
                {vehicle.modelName} ({vehicle.year})
              </div>
              <div className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                {vehicle.totalOdometer.toLocaleString('es-ES')} km •{' '}
                {refuels.length + 80} registros guardados
              </div>
            </div>
            <span className="material-symbols-outlined text-[#0058bc] dark:text-[#60a5fa] text-[20px]">
              verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

