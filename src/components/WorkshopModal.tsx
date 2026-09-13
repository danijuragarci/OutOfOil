import React, { useState, useRef } from 'react';
import { WorkshopExpense } from '../types';

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOdometer: number;
  onAddExpense: (expense: WorkshopExpense) => void;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  currentOdometer,
  onAddExpense,
}) => {
  const [concept, setConcept] = useState('');
  const [workshopName, setWorkshopName] = useState('Taller Oficial / Especializado');
  const [cost, setCost] = useState('');
  const [odometer, setOdometer] = useState(currentOdometer);
  const [invoicePhoto, setInvoicePhoto] = useState<string | null>(null);
  const [hasReplacementInterval, setHasReplacementInterval] = useState(true);
  const [replacementIntervalKm, setReplacementIntervalKm] = useState<number | ''>(30000);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setInvoicePhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickPreset = (km: number) => {
    setHasReplacementInterval(true);
    setReplacementIntervalKm(km);
  };

  const calculatedNextKm =
    hasReplacementInterval && replacementIntervalKm && replacementIntervalKm > 0
      ? Number(odometer) + Number(replacementIntervalKm)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !cost) return;

    const parsedCost = parseFloat(cost.replace(',', '.')) || 0;
    const parsedOdometer = Number(odometer) || currentOdometer;
    const interval = hasReplacementInterval && replacementIntervalKm ? Number(replacementIntervalKm) : undefined;
    const nextOdometer = interval ? parsedOdometer + interval : undefined;

    const newExpense: WorkshopExpense = {
      id: `ws-${Date.now()}`,
      concept,
      workshopName: workshopName.trim() || 'Taller Particular',
      date: 'Hoy',
      odometer: parsedOdometer,
      cost: parsedCost,
      invoicePhotoUrl: invoicePhoto || undefined,
      replacementIntervalKm: interval,
      nextReplacementOdometer: nextOdometer,
    };

    onAddExpense(newExpense);
    // Reset form state
    setConcept('');
    setCost('');
    setInvoicePhoto(null);
    setReplacementIntervalKm(30000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-[#1c1d24] text-[#1a1b1f] dark:text-[#f2f3f8] rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 border border-black/[0.06] dark:border-white/[0.08] animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-[#1c1d24] pb-2 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#0058bc]/10 dark:bg-[#0058bc]/25 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight">Nueva Factura / Gasto</h3>
              <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">Registro de mantenimiento y piezas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eeedf3] dark:bg-[#2a2c36] flex items-center justify-center text-[#414755] dark:text-[#c1c6d7] hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[17px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Concepto */}
          <div>
            <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
              Concepto / Operación realizada *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Sustitución filtro de gasoil y aire, pastillas freno..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#f4f3f8] dark:bg-[#23252e] text-[13px] text-[#1a1b1f] dark:text-[#f2f3f8] outline-none focus:ring-2 focus:ring-[#0058bc]"
            />
          </div>

          {/* Taller */}
          <div>
            <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
              Taller o Proveedor de recambios
            </label>
            <input
              type="text"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#f4f3f8] dark:bg-[#23252e] text-[13px] text-[#1a1b1f] dark:text-[#f2f3f8] outline-none focus:ring-2 focus:ring-[#0058bc]"
            />
          </div>

          {/* Importe y Kilometraje */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                Importe Total (€) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f4f3f8] dark:bg-[#23252e] text-[15px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] outline-none focus:ring-2 focus:ring-[#0058bc]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#717786] font-bold">€</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                Kilometraje de montaje *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={odometer}
                  onChange={(e) => setOdometer(Number(e.target.value))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#f4f3f8] dark:bg-[#23252e] text-[13px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] outline-none focus:ring-2 focus:ring-[#0058bc]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#717786] font-medium">km</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: FOTOGRAFÍA DE LA FACTURA */}
          <div className="p-3.5 rounded-2xl bg-[#f4f3f8]/70 dark:bg-[#23252e]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#0058bc] dark:text-[#60a5fa]">
                  photo_camera
                </span>
                <span className="text-[12px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
                  Fotografía de la Factura / Albarán
                </span>
              </div>
              {invoicePhoto && (
                <span className="text-[10px] font-bold text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25 px-2 py-0.5 rounded-full">
                  Foto adjunta
                </span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            {!invoicePhoto ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-[#c1c6d7] dark:border-white/20 hover:border-[#0058bc] dark:hover:border-[#60a5fa] bg-white/60 dark:bg-black/20 flex items-center justify-center gap-2.5 text-[#414755] dark:text-[#c1c6d7] active:scale-[0.99] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#0058bc]/10 dark:bg-[#0058bc]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                </div>
                <div className="text-left">
                  <span className="text-[12px] font-semibold block leading-tight">
                    Hacer foto o adjuntar recibo
                  </span>
                  <span className="text-[10px] text-[#717786] dark:text-[#a2a7b7]">
                    JPG, PNG o foto con la cámara del móvil
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-2 bg-white dark:bg-[#1a1b22] rounded-xl border border-black/[0.05] dark:border-white/[0.08]">
                <div
                  onClick={() => setPreviewPhotoModal(invoicePhoto)}
                  className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-black/10 dark:border-white/10 cursor-pointer group"
                >
                  <img
                    src={invoicePhoto}
                    alt="Ticket de factura"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-[16px]">visibility</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-semibold text-[#1a1b1f] dark:text-[#f2f3f8] truncate block">
                    Factura digitalizada
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewPhotoModal(invoicePhoto)}
                      className="text-[11px] font-semibold text-[#0058bc] dark:text-[#60a5fa] hover:underline"
                    >
                      Ver ampliada
                    </button>
                    <span className="text-[#c1c6d7]">•</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-medium text-[#717786] dark:text-[#a2a7b7] hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInvoicePhoto(null)}
                  className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[#ba1a1a] dark:text-[#ffb4ab] flex items-center justify-center transition-colors"
                  title="Eliminar foto"
                >
                  <span className="material-symbols-outlined text-[17px]">delete</span>
                </button>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: INTERVALO DE REEMPLAZO DE LA PIEZA */}
          <div className="p-3.5 rounded-2xl bg-[#f4f3f8]/70 dark:bg-[#23252e]/60 border border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#fe9400] dark:text-[#f59e0b]">
                  update
                </span>
                <span className="text-[12px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
                  Sustitución periódica de la pieza
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasReplacementInterval(!hasReplacementInterval)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  hasReplacementInterval
                    ? 'bg-[#0058bc]/10 text-[#0058bc] dark:bg-[#0058bc]/25 dark:text-[#60a5fa]'
                    : 'bg-black/5 text-[#717786] dark:bg-white/10 dark:text-[#a2a7b7]'
                }`}
              >
                {hasReplacementInterval ? 'Activo' : 'No programar'}
              </button>
            </div>

            <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7] leading-relaxed">
              Define tras cuántos kilómetros se debe volver a reemplazar este componente (ej. filtro de gasoil cada 30.000 km).
            </p>

            {hasReplacementInterval && (
              <div className="space-y-2.5 pt-1">
                {/* Interval Input */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#414755] dark:text-[#c1c6d7]">Reemplazar en:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step={1000}
                      placeholder="30000"
                      value={replacementIntervalKm}
                      onChange={(e) =>
                        setReplacementIntervalKm(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#1a1b22] text-[13px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] outline-none focus:ring-2 focus:ring-[#0058bc] border border-black/[0.06] dark:border-white/[0.08]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#717786] font-medium">km</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-semibold text-[#717786] dark:text-[#a2a7b7] uppercase tracking-wider block mb-1">
                    Intervalos habituales sugeridos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '+15.000 km (Aceite)', km: 15000 },
                      { label: '+30.000 km (Filtro gasoil)', km: 30000 },
                      { label: '+45.000 km (Pastillas)', km: 45000 },
                      { label: '+60.000 km (Discos)', km: 60000 },
                      { label: '+100.000 km (Líquido/Cadena)', km: 100000 },
                    ].map((preset) => (
                      <button
                        key={preset.km}
                        type="button"
                        onClick={() => handleQuickPreset(preset.km)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          replacementIntervalKm === preset.km
                            ? 'bg-[#0058bc] text-white border-[#0058bc] font-semibold shadow-xs'
                            : 'bg-white dark:bg-[#1c1d24] text-[#414755] dark:text-[#c1c6d7] border-black/10 dark:border-white/10 hover:border-[#0058bc]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Result Card */}
                {calculatedNextKm && (
                  <div className="p-2.5 rounded-xl bg-[#006b27]/10 dark:bg-[#006b27]/20 border border-[#006b27]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006b27] dark:text-[#34d399]">
                        event_upcoming
                      </span>
                      <span className="text-[12px] font-medium text-[#006b27] dark:text-[#34d399]">
                        Próximo cambio previsto a los:
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[#006b27] dark:text-[#34d399]">
                      {calculatedNextKm.toLocaleString('es-ES')} km
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-2 pt-1 sticky bottom-0 bg-white dark:bg-[#1c1d24]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#eeedf3] dark:bg-[#2a2c36] text-[#1a1b1f] dark:text-[#f2f3f8] text-[13px] font-semibold active:scale-98 transition-transform"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#0058bc] hover:bg-[#004ca3] text-white text-[13px] font-semibold shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Guardar Factura</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal visor de foto ampliada */}
      {previewPhotoModal && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoModal(null)}
        >
          <div className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewPhotoModal(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <img
              src={previewPhotoModal}
              alt="Factura ampliada"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/15"
            />
            <span className="text-white text-[12px] font-medium mt-3 bg-black/40 px-3 py-1 rounded-full">
              Fotografía de la factura
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

