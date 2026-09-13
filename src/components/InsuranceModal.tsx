import React, { useState } from 'react';
import { MaintenanceState, InsuranceFrequency } from '../types';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: MaintenanceState;
  onUpdateInsurance: (updated: {
    insuranceCompany: string;
    insurancePaymentFrequency: InsuranceFrequency;
    insuranceInstallmentCost: number;
    insurancePremium: number;
    insuranceRenewDate: string;
  }) => void;
  onShowToast: (msg: string) => void;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({
  isOpen,
  onClose,
  maintenance,
  onUpdateInsurance,
  onShowToast,
}) => {
  const [company, setCompany] = useState(maintenance.insuranceCompany);
  const [frequency, setFrequency] = useState<InsuranceFrequency>(
    maintenance.insurancePaymentFrequency || 'anual'
  );
  const [installmentCost, setInstallmentCost] = useState(
    maintenance.insuranceInstallmentCost?.toString() ||
      maintenance.insurancePremium.toString()
  );
  const [renewDate, setRenewDate] = useState(maintenance.insuranceRenewDate);

  if (!isOpen) return null;

  // Payments per year multiplier
  const getFrequencyMultiplier = (freq: InsuranceFrequency): number => {
    switch (freq) {
      case 'anual':
        return 1;
      case 'semestral':
        return 2;
      case 'cuatrimestral':
        return 3;
      case 'trimestral':
        return 4;
      case 'mensual':
        return 12;
    }
  };

  const currentCost = parseFloat(installmentCost.replace(',', '.')) || 0;
  const multiplier = getFrequencyMultiplier(frequency);
  const calculatedAnnualTotal = Number((currentCost * multiplier).toFixed(2));
  const calculatedMonthlyEquivalent = Number((calculatedAnnualTotal / 12).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || currentCost <= 0) return;

    onUpdateInsurance({
      insuranceCompany: company.trim(),
      insurancePaymentFrequency: frequency,
      insuranceInstallmentCost: currentCost,
      insurancePremium: calculatedAnnualTotal,
      insuranceRenewDate: renewDate,
    });

    onShowToast(`Seguro actualizado: Pago ${frequency} (${currentCost.toFixed(2)} €/recibo)`);
    onClose();
  };

  const frequencyOptions: { label: string; value: InsuranceFrequency; countText: string }[] = [
    { label: 'Anual', value: 'anual', countText: '1 cobro al año' },
    { label: 'Semestral', value: 'semestral', countText: '2 recibos al año' },
    { label: 'Cuatrimestral', value: 'cuatrimestral', countText: '3 recibos al año' },
    { label: 'Trimestral', value: 'trimestral', countText: '4 recibos al año' },
    { label: 'Mensual', value: 'mensual', countText: '12 recibos al año' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1c1d24] text-[#1a1b1f] dark:text-[#f2f3f8] rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 border border-black/[0.04] dark:border-white/[0.08] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#0058bc]/15 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold leading-tight">Póliza de Seguro</h3>
              <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">Fraccionamiento y cuotas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#eeedf3] dark:bg-[#2b2e39] flex items-center justify-center text-[#414755] dark:text-[#a2a7b7]"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Compañía */}
          <div>
            <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
              Compañía y tipo de cobertura
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ej: Mapfre Terceros Ampliado"
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[13px] outline-none focus:ring-1 focus:ring-[#0058bc] dark:focus:ring-[#3b82f6]"
            />
          </div>

          {/* Frecuencia de pago */}
          <div>
            <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1.5">
              Frecuencia de pago del seguro
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {frequencyOptions.map((opt) => {
                const isSelected = frequency === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className={`py-2 px-2.5 rounded-xl text-center border text-[12px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[#0058bc] text-white border-[#0058bc] shadow-xs'
                        : 'bg-[#f4f3f8] dark:bg-[#262830] text-[#414755] dark:text-[#c1c6d7] border-transparent hover:border-black/10'
                    }`}
                  >
                    <span className="block font-semibold">{opt.label}</span>
                    <span className="text-[10px] opacity-80 block mt-0.5">{opt.countText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Importe del recibo y fecha */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                Importe por recibo (€)
              </label>
              <input
                type="text"
                required
                value={installmentCost}
                onChange={(e) => setInstallmentCost(e.target.value)}
                placeholder="0,00"
                className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[14px] font-bold outline-none focus:ring-1 focus:ring-[#0058bc] dark:focus:ring-[#3b82f6]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                Próximo cobro
              </label>
              <input
                type="text"
                required
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                placeholder="22 Jun 2025"
                className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[13px] outline-none focus:ring-1 focus:ring-[#0058bc] dark:focus:ring-[#3b82f6]"
              />
            </div>
          </div>

          {/* Resumen del cálculo anual */}
          <div className="p-3 bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl flex items-center justify-between border border-black/[0.02] dark:border-white/[0.04]">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                Coste Anual ({multiplier} {multiplier === 1 ? 'cuota' : 'cuotas'})
              </span>
              <span className="text-[16px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
                {calculatedAnnualTotal.toFixed(2).replace('.', ',')} € / año
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                Equivalente mensual
              </span>
              <span className="text-[13px] font-semibold text-[#0058bc] dark:text-[#60a5fa]">
                ~{calculatedMonthlyEquivalent.toFixed(2).replace('.', ',')} €/mes
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full bg-[#eeedf3] dark:bg-[#2b2e39] text-[#1a1b1f] dark:text-[#f2f3f8] text-[13px] font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-full bg-[#0058bc] text-white text-[13px] font-semibold shadow-sm hover:bg-[#004493] active:scale-[0.98] transition-all"
            >
              Guardar Seguro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
