import React, { useState } from 'react';
import { MaintenanceState, VehicleInfo } from '../types';
import { defaultItvChecklist } from '../initialData';

interface MaintenanceScreenProps {
  vehicle: VehicleInfo;
  maintenance: MaintenanceState;
  onResetOilCycle: () => void;
  onToggleItvAlerts: () => void;
  onOpenWorkshopModal: () => void;
  onOpenInsuranceModal: () => void;
  onToggleChecklistItem: (id: string, isItv?: boolean) => void;
  onSetAllItvChecklist?: (allOk: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  vehicle,
  maintenance,
  onResetOilCycle,
  onToggleItvAlerts,
  onOpenWorkshopModal,
  onOpenInsuranceModal,
  onToggleChecklistItem,
  onSetAllItvChecklist,
  onShowToast,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [activeChecklistTab, setActiveChecklistTab] = useState<'itv' | 'preventive'>('itv');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const percentageUsed = Math.min(
    100,
    Math.round((maintenance.oilCycleKm / maintenance.oilIntervalKm) * 100)
  );
  const remainingKm = Math.max(0, maintenance.oilIntervalKm - maintenance.oilCycleKm);

  const handleConfirmReset = () => {
    onResetOilCycle();
    setShowConfirmReset(false);
    onShowToast('¡Contador de aceite reseteado! Registrado nuevo cambio a los 0 km.');
  };

  const getFrequencyLabel = (freq?: string) => {
    switch (freq) {
      case 'semestral':
        return 'Pago Semestral (2 cuotas/año)';
      case 'cuatrimestral':
        return 'Pago Cuatrimestral (3 cuotas/año)';
      case 'trimestral':
        return 'Pago Trimestral (4 cuotas/año)';
      case 'mensual':
        return 'Pago Mensual (12 cuotas/año)';
      case 'anual':
      default:
        return 'Pago Anual (1 cuota/año)';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-24 space-y-4">
      {/* Tarjeta Resumen Superior del Vehículo */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.03]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fe9400]/15 flex items-center justify-center text-[#8c5000]">
              <span className="material-symbols-outlined text-[28px]">
                directions_car
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold text-[#1a1b1f]">
                  {vehicle.modelName.replace(' CRDi', '')}
                </span>
                <span className="bg-[#fe9400]/15 text-[#8c5000] text-[11px] px-1.5 py-0.5 rounded-full font-bold">
                  CRDi
                </span>
              </div>
              <p className="text-[12px] text-[#717786]">
                {vehicle.year} • 115 CV Turbodiésel
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 bg-[#006b27]/10 text-[#006b27] px-2.5 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#006b27] animate-pulse" />
            <span className="text-[11px] font-bold">Salud Óptima</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 bg-[#f4f3f8] rounded-2xl p-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#717786]">Odómetro actual</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[22px] font-bold text-[#1a1b1f] tracking-tight">
                {vehicle.totalOdometer.toLocaleString('es-ES')}
              </span>
              <span className="text-[12px] text-[#717786]">km</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#717786]">Ritmo de rodaje</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[22px] font-bold text-[#0058bc] tracking-tight">
                {vehicle.monthlyKmRate.toLocaleString('es-ES')}
              </span>
              <span className="text-[12px] text-[#717786]">km/mes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Predictor Inteligente Aceite Sintético & Filtro */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.03] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#fe9400]/15 text-[#8c5000] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                oil_barrel
              </span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#1a1b1f] tracking-tight">
                Aceite Sintético 5W-30 + Filtro
              </h2>
              <p className="text-[11px] text-[#717786]">
                Intervalo estricto cada {maintenance.oilIntervalKm.toLocaleString('es-ES')} km
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              percentageUsed > 85
                ? 'bg-[#ba1a1a]/15 text-[#ba1a1a]'
                : 'bg-[#fe9400]/15 text-[#8c5000]'
            }`}
          >
            {percentageUsed}% consumido
          </span>
        </div>

        {/* Barra de progreso segmentada */}
        <div className="mt-4">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[11px] text-[#717786]">Progreso del ciclo</span>
            <span className="text-[13px] font-bold text-[#1a1b1f]">
              {maintenance.oilCycleKm.toLocaleString('es-ES')}{' '}
              <span className="text-[11px] text-[#717786] font-normal">
                / {maintenance.oilIntervalKm.toLocaleString('es-ES')} km
              </span>
            </span>
          </div>

          <div className="w-full h-3.5 bg-[#eeedf3] rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                percentageUsed > 85 ? 'bg-[#ba1a1a]' : 'bg-[#fe9400]'
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>

        {/* Métrica restante y Proyección */}
        <div className="mt-4 p-3 rounded-2xl bg-[#f4f3f8] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#717786]">
              Margen restante de protección:
            </span>
            <span
              className={`text-[14px] font-bold ${
                remainingKm < 1000 ? 'text-[#ba1a1a]' : 'text-[#8c5000]'
              }`}
            >
              {remainingKm.toLocaleString('es-ES')} km
            </span>
          </div>

          <div className="flex items-start gap-2 pt-2 bg-white/70 p-2.5 rounded-xl border border-black/[0.03]">
            <span className="material-symbols-outlined text-[#0058bc] text-[18px] mt-0.5 shrink-0">
              auto_graph
            </span>
            <div className="text-[#1a1b1f]">
              <p className="text-[11px] font-bold text-[#0058bc]">
                Previsión según tus hábitos
              </p>
              <p className="text-[12px] text-[#717786] mt-0.5 leading-snug">
                Fecha estimada de cambio:{' '}
                <span className="text-[#1a1b1f] font-semibold">
                  {maintenance.oilEstimatedDate}
                </span>{' '}
                (en aprox. {maintenance.oilEstimatedDays} días a tu media de{' '}
                {vehicle.monthlyKmRate.toLocaleString('es-ES')} km/mes).
              </p>
            </div>
          </div>
        </div>

        {/* Botón Resetear Aceite */}
        <button
          type="button"
          onClick={() => setShowConfirmReset(true)}
          className="w-full mt-3 h-11 bg-[#0058bc]/10 hover:bg-[#0058bc]/15 active:bg-[#0058bc]/20 text-[#0058bc] rounded-full text-[13px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            restart_alt
          </span>
          <span>Registrar cambio realizado (Resetear contador)</span>
        </button>
      </div>

      {/* Confirmation modal for oil reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#fe9400]/15 text-[#8c5000] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">
                oil_barrel
              </span>
            </div>
            <h3 className="text-[17px] font-bold text-[#1a1b1f]">
              ¿Registrar cambio de aceite?
            </h3>
            <p className="text-[13px] text-[#717786] mt-1.5 leading-relaxed">
              El contador de ciclo volverá a 0 km y se registrará la fecha de hoy con el kilometraje actual ({vehicle.totalOdometer.toLocaleString('es-ES')} km).
            </p>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="py-2.5 rounded-xl bg-[#eeedf3] text-[#1a1b1f] text-[13px] font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="py-2.5 rounded-xl bg-[#0058bc] text-white text-[13px] font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ITV Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.03]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#006b27]/15 text-[#006b27] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                verified
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-[#1a1b1f]">
                  ITV Periódica
                </span>
                <span className="bg-[#006b27]/15 text-[#006b27] text-[11px] px-2 py-0.5 rounded-full font-bold">
                  Vigente
                </span>
              </div>
              <p className="text-[11px] text-[#717786]">
                Estación Autorizada DGT
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[13px] text-[#006b27] font-bold">
              {maintenance.itvDaysRemaining} días
            </span>
          </div>
        </div>

        <div className="mt-3.5 p-3 bg-[#f4f3f8] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#717786] block">
              Fecha límite inspección
            </span>
            <span className="text-[14px] font-semibold text-[#1a1b1f]">
              {maintenance.itvValidUntil}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#717786]">Alertas</span>
            <button
              type="button"
              role="switch"
              aria-checked={maintenance.itvAlertsEnabled}
              onClick={onToggleItvAlerts}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex-shrink-0 ${
                maintenance.itvAlertsEnabled ? 'bg-[#008733]' : 'bg-[#e3e2e7]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  maintenance.itvAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#717786] mt-2 px-1">
          Notificaciones push programadas a los 30 y 7 días de antelación.
        </p>
      </div>

      {/* Póliza de Seguro (User Requirement: editar si el seguro se paga anual, semestral, cuatrimestral, trimestral o mensual) */}
      <div className="bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0058bc]/15 dark:bg-[#0058bc]/25 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                security
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-bold">
                  Póliza de Seguro
                </span>
              </div>
              <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                {maintenance.insuranceCompany}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-bold bg-[#0058bc]/15 text-[#0058bc] dark:text-[#60a5fa] px-2 py-0.5 rounded-full">
              {maintenance.insuranceDaysRemaining} días
            </span>
            <span className="text-[10px] font-bold text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {maintenance.insurancePaymentFrequency || 'anual'}
            </span>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2 p-3 bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl">
          <div>
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] block">
              Próximo cobro
            </span>
            <span className="text-[14px] font-semibold">
              {maintenance.insuranceRenewDate}
            </span>
            <span className="text-[10px] text-[#717786] dark:text-[#a2a7b7] block mt-0.5">
              {getFrequencyLabel(maintenance.insurancePaymentFrequency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] block">
              Cuota periódica
            </span>
            <span className="text-[18px] font-bold text-[#0058bc] dark:text-[#60a5fa]">
              {(
                maintenance.insuranceInstallmentCost || maintenance.insurancePremium
              )
                .toFixed(2)
                .replace('.', ',')}{' '}
              €
            </span>
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] block mt-0.5">
              Total anual: {maintenance.insurancePremium.toFixed(2).replace('.', ',')} €
            </span>
          </div>
        </div>

        {/* CTA to Edit Insurance & Payment Frequency */}
        <button
          type="button"
          onClick={onOpenInsuranceModal}
          className="w-full mt-3 h-10 bg-[#f4f3f8] dark:bg-[#282b35] hover:bg-[#eeedf3] dark:hover:bg-[#323644] active:scale-[0.98] text-[#0058bc] dark:text-[#60a5fa] rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <span className="material-symbols-outlined text-[17px]">
            edit_calendar
          </span>
          <span>Editar aseguradora y periodicidad de pago</span>
        </button>
      </div>

      {/* Checklist de Mantenimiento y Comprobación Pre-ITV */}
      <div className="bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm border border-black/[0.03] dark:border-white/[0.05] space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold tracking-tight text-[#1a1b1f] dark:text-[#f2f3f8]">
              Checklist & Inspecciones
            </h2>
            <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
              Comprobaciones preventivas y puntos oficiales de ITV
            </p>
          </div>
          <span className="material-symbols-outlined text-[#717786] dark:text-[#a2a7b7]">
            checklist_rtl
          </span>
        </div>

        {/* Segmented Control de pestañas */}
        {(() => {
          const itvList = maintenance.itvChecklist && maintenance.itvChecklist.length > 0
            ? maintenance.itvChecklist
            : defaultItvChecklist;
          const itvOkCount = itvList.filter((item) => item.status === 'ok').length;
          const prevOkCount = maintenance.checklist.filter((item) => item.status === 'ok').length;

          return (
            <div className="flex p-1 bg-[#f4f3f8] dark:bg-[#23252e] rounded-xl text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveChecklistTab('itv')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeChecklistTab === 'itv'
                    ? 'bg-white dark:bg-[#1a1b22] text-[#0058bc] dark:text-[#60a5fa] shadow-xs font-bold'
                    : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f] dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Pre-ITV Cerato</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeChecklistTab === 'itv'
                      ? 'bg-[#0058bc]/10 text-[#0058bc] dark:bg-[#0058bc]/25 dark:text-[#60a5fa]'
                      : 'bg-black/5 dark:bg-white/10'
                  }`}
                >
                  {itvOkCount}/{itvList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChecklistTab('preventive')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeChecklistTab === 'preventive'
                    ? 'bg-white dark:bg-[#1a1b22] text-[#0058bc] dark:text-[#60a5fa] shadow-xs font-bold'
                    : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f] dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Preventivo Motor</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeChecklistTab === 'preventive'
                      ? 'bg-[#0058bc]/10 text-[#0058bc] dark:bg-[#0058bc]/25 dark:text-[#60a5fa]'
                      : 'bg-black/5 dark:bg-white/10'
                  }`}
                >
                  {prevOkCount}/{maintenance.checklist.length}
                </span>
              </button>
            </div>
          );
        })()}

        {/* TAB 1: CHECKLIST DE COMPROBACIÓN ITV */}
        {activeChecklistTab === 'itv' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {(() => {
              const itvList = maintenance.itvChecklist && maintenance.itvChecklist.length > 0
                ? maintenance.itvChecklist
                : defaultItvChecklist;
              const okCount = itvList.filter((item) => item.status === 'ok').length;
              const percent = Math.round((okCount / itvList.length) * 100);
              const isReady = okCount === itvList.length;

              return (
                <div className="p-3 bg-[#f8f9fc] dark:bg-[#20222b] rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[12px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] block">
                        Estado de Preparación para la ITV
                      </span>
                      <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                        Kia Cerato 1.6 CRDi (115 CV • Diésel)
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isReady
                          ? 'bg-[#006b27]/15 text-[#006b27] dark:text-[#34d399]'
                          : 'bg-[#fe9400]/15 text-[#8c5000] dark:text-[#f59e0b]'
                      }`}
                    >
                      {okCount} de {itvList.length} revisados ({percent}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isReady ? 'bg-[#006b27] dark:bg-[#34d399]' : 'bg-[#fe9400] dark:bg-[#f59e0b]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Bulk toggle buttons */}
                  {onSetAllItvChecklist && (
                    <div className="flex items-center justify-end gap-2 pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => onSetAllItvChecklist(true)}
                        className="font-semibold text-[#0058bc] dark:text-[#60a5fa] hover:underline"
                      >
                        ✓ Marcar todos Favorables
                      </button>
                      <span className="text-[#c1c6d7]">•</span>
                      <button
                        type="button"
                        onClick={() => onSetAllItvChecklist(false)}
                        className="font-medium text-[#717786] dark:text-[#a2a7b7] hover:underline"
                      >
                        Reiniciar
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* List of ITV inspection points */}
            <div className="space-y-2 mt-2">
              {(maintenance.itvChecklist && maintenance.itvChecklist.length > 0
                ? maintenance.itvChecklist
                : defaultItvChecklist
              ).map((item) => {
                const isOk = item.status === 'ok';
                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleChecklistItem(item.id, true)}
                    className={`p-3 rounded-2xl flex items-start justify-between cursor-pointer transition-all active:scale-[0.99] border ${
                      isOk
                        ? 'bg-[#f4f3f8] dark:bg-[#23252e] border-transparent'
                        : 'bg-[#fe9400]/10 dark:bg-[#fe9400]/15 border-[#fe9400]/25'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isOk
                            ? 'bg-[#006b27]/15 text-[#006b27] dark:text-[#34d399]'
                            : 'bg-[#fe9400]/20 text-[#8c5000] dark:text-[#f59e0b]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isOk ? 'check_circle' : 'warning'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold block leading-snug text-[#1a1b1f] dark:text-[#f2f3f8]">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] block mt-0.5 leading-relaxed">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 mt-0.5 ${
                        isOk
                          ? 'text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25'
                          : 'text-[#8c5000] dark:text-[#f59e0b] bg-[#fe9400]/20 dark:bg-[#fe9400]/30'
                      }`}
                    >
                      {item.badgeText || (isOk ? 'Favorable' : 'Revisar')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CHECKLIST PREVENTIVO MOTOR */}
        {activeChecklistTab === 'preventive' && (
          <div className="space-y-2 mt-1 animate-in fade-in duration-150">
            {maintenance.checklist.map((item) => {
              const isOk = item.status === 'ok';
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklistItem(item.id, false)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                    isOk ? 'bg-[#f4f3f8] dark:bg-[#23252e]' : 'bg-[#fe9400]/10 dark:bg-[#fe9400]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isOk
                          ? 'bg-[#006b27]/15 text-[#006b27] dark:text-[#34d399]'
                          : 'bg-[#fe9400]/20 text-[#8c5000] dark:text-[#f59e0b]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isOk ? 'check' : 'pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] font-semibold block leading-snug">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                      isOk
                        ? 'text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25'
                        : 'text-[#8c5000] dark:text-[#f59e0b] bg-[#fe9400]/20 dark:bg-[#fe9400]/30'
                    }`}
                  >
                    {item.badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workshop Expenses List with Photo and Replacement Tracking */}
      {maintenance.workshopExpenses.length > 0 && (
        <div className="bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm border border-black/[0.03] dark:border-white/[0.05] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
              Historial de Facturas y Piezas
            </h3>
            <span className="text-[11px] font-bold text-[#0058bc] dark:text-[#60a5fa] bg-[#0058bc]/10 dark:bg-[#0058bc]/20 px-2 py-0.5 rounded-full">
              {maintenance.workshopExpenses.length} facturas
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {maintenance.workshopExpenses.map((exp) => {
              const nextKm =
                exp.nextReplacementOdometer ||
                (exp.replacementIntervalKm ? exp.odometer + exp.replacementIntervalKm : null);
              const remainingKm = nextKm ? nextKm - vehicle.totalOdometer : null;

              return (
                <div
                  key={exp.id}
                  className="p-3 bg-[#f4f3f8] dark:bg-[#23252e] rounded-xl flex flex-col gap-2 border border-black/[0.03] dark:border-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Thumbnail or Icon */}
                      {exp.invoicePhotoUrl ? (
                        <div
                          onClick={() => setPreviewPhotoUrl(exp.invoicePhotoUrl!)}
                          className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-black/10 dark:border-white/10 cursor-pointer group"
                          title="Ver fotografía de la factura"
                        >
                          <img
                            src={exp.invoicePhotoUrl}
                            alt="Factura"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-[14px]">visibility</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#0058bc]/10 dark:bg-[#0058bc]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">receipt</span>
                        </div>
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] leading-tight">
                          {exp.concept}
                        </span>
                        <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] mt-0.5">
                          {exp.workshopName} • {exp.date} • {exp.odometer.toLocaleString('es-ES')} km
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[14px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
                        {exp.cost.toFixed(2).replace('.', ',')} €
                      </span>
                      {exp.invoicePhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoUrl(exp.invoicePhotoUrl!)}
                          className="text-[10px] font-semibold text-[#0058bc] dark:text-[#60a5fa] flex items-center gap-0.5 mt-0.5 hover:underline"
                        >
                          <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                          <span>Ver factura</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ciclo de Reemplazo de la Pieza */}
                  {nextKm && (
                    <div className="mt-1 pt-2 border-t border-black/[0.05] dark:border-white/[0.05] flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#717786] dark:text-[#a2a7b7]">
                        <span className="material-symbols-outlined text-[14px] text-[#0058bc] dark:text-[#60a5fa]">
                          autorenew
                        </span>
                        <span>
                          Sustituir cada{' '}
                          <strong className="text-[#1a1b1f] dark:text-[#f2f3f8]">
                            {(exp.replacementIntervalKm || 30000).toLocaleString('es-ES')} km
                          </strong>
                        </span>
                      </div>

                      {remainingKm !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                            remainingKm <= 0
                              ? 'bg-[#ba1a1a]/15 text-[#ba1a1a] dark:text-[#ffb4ab]'
                              : remainingKm < 3000
                              ? 'bg-[#fe9400]/15 text-[#8c5000] dark:text-[#f59e0b]'
                              : 'bg-[#006b27]/10 text-[#006b27] dark:text-[#34d399]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {remainingKm <= 0 ? 'priority_high' : remainingKm < 3000 ? 'schedule' : 'check_circle'}
                          </span>
                          <span>
                            {remainingKm <= 0
                              ? `Vencido hace ${Math.abs(remainingKm).toLocaleString('es-ES')} km`
                              : remainingKm < 3000
                              ? `Próximo cambio en ${remainingKm.toLocaleString('es-ES')} km`
                              : `Quedan ${remainingKm.toLocaleString('es-ES')} km (a los ${nextKm.toLocaleString('es-ES')} km)`}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botón de acción principal iOS: Añadir factura */}
      <div className="pt-2 pb-1">
        <button
          type="button"
          onClick={onOpenWorkshopModal}
          className="w-full h-12 bg-[#0058bc] hover:bg-[#004493] active:scale-[0.98] text-white rounded-full text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">
            receipt_long
          </span>
          <span>Añadir gasto o factura de taller</span>
        </button>
      </div>

      {/* Modal visor de foto de factura */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <img
              src={previewPhotoUrl}
              alt="Factura completa"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/15"
            />
            <span className="text-white text-[12px] font-medium mt-3 bg-black/40 px-3 py-1 rounded-full">
              Fotografía de la factura / recibo
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
