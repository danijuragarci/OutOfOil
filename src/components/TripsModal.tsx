import React, { useState } from 'react';
import { PlannedTrip, VehicleInfo } from '../types';

interface TripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: PlannedTrip[];
  vehicle: VehicleInfo;
  onAddTrip: (trip: PlannedTrip) => void;
  onDeleteTrip: (id: string) => void;
  onToggleCompleteTrip: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const TripsModal: React.FC<TripsModalProps> = ({
  isOpen,
  onClose,
  trips,
  vehicle,
  onAddTrip,
  onDeleteTrip,
  onToggleCompleteTrip,
  onShowToast,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('Valencia');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState('650');
  const [date, setDate] = useState('Próximo mes');
  const [notes, setNotes] = useState('');
  const [excludeFromMonthlyRate, setExcludeFromMonthlyRate] = useState(true);

  if (!isOpen) return null;

  const distNumber = parseFloat(distanceKm) || 0;
  // Kia Cerato 1.6 CRDi average consumption (5.4 L/100km)
  const estimatedLiters = Number(((distNumber * vehicle.avgConsumption) / 100).toFixed(1));
  const estimatedCost = Number((estimatedLiters * 1.44).toFixed(2));

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || distNumber <= 0) return;

    const newTrip: PlannedTrip = {
      id: `trip-${Date.now()}`,
      title: title.trim(),
      origin: origin.trim() || 'Valencia',
      destination: destination.trim() || 'Destino',
      distanceKm: distNumber,
      date: date.trim() || 'Próximamente',
      notes: notes.trim(),
      excludeFromMonthlyRate,
      estimatedFuelLiters: estimatedLiters,
      estimatedFuelCost: estimatedCost,
      isCompleted: false,
    };

    onAddTrip(newTrip);
    onShowToast(`Viaje "${newTrip.title}" programado (${newTrip.distanceKm} km)`);
    setIsCreating(false);
    setTitle('');
    setDestination('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1c1d24] text-[#1a1b1f] dark:text-[#f2f3f8] rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 border border-black/[0.04] dark:border-white/[0.08] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#0058bc]/15 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">map</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold leading-tight">Viajes y Rutas Largas</h3>
              <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                Rodaje extraordinario sin distorsionar medias
              </p>
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

        {/* Informative Banner on why this protects metrics */}
        <div className="p-3 rounded-2xl bg-[#0058bc]/10 dark:bg-[#3b82f6]/15 border border-[#0058bc]/20 text-[12px] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#0058bc] dark:text-[#60a5fa] text-[20px] shrink-0 mt-0.5">
            shield
          </span>
          <p className="text-[#1a1b1f] dark:text-[#f2f3f8] leading-snug">
            Los viajes puntuales se computan en odómetro y combustible, pero se pueden <strong className="font-semibold text-[#0058bc] dark:text-[#60a5fa]">excluir de tu ritmo habitual de km/mes</strong> para no alterar la estimación de desgaste del aceite sintético.
          </p>
        </div>

        {/* Trips List or Form */}
        {!isCreating ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#717786] dark:text-[#a2a7b7] uppercase tracking-wider">
                Viajes Registrados ({trips.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 rounded-full bg-[#0058bc] text-white text-[12px] font-semibold flex items-center gap-1 hover:bg-[#004493] active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Planificar Viaje</span>
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#717786] dark:text-[#a2a7b7]">
                No tienes viajes extraordinarios guardados.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      trip.isCompleted
                        ? 'bg-[#f4f3f8]/60 dark:bg-[#16171d]/60 border-black/[0.04] dark:border-white/[0.04] opacity-75'
                        : 'bg-white dark:bg-[#23252e] border-black/[0.06] dark:border-white/[0.08] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleCompleteTrip(trip.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            trip.isCompleted
                              ? 'bg-[#006b27] border-[#006b27] text-white'
                              : 'border-[#717786] dark:border-[#a2a7b7] hover:border-[#0058bc]'
                          }`}
                        >
                          {trip.isCompleted && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </button>
                        <h4 className={`text-[14px] font-bold ${trip.isCompleted ? 'line-through text-[#717786]' : ''}`}>
                          {trip.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteTrip(trip.id)}
                        className="text-[#ba1a1a] hover:opacity-80 p-0.5"
                        title="Eliminar viaje"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[12px] text-[#717786] dark:text-[#a2a7b7]">
                      <span>
                        {trip.origin} ➔ {trip.destination} ({trip.date})
                      </span>
                      <span className="font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
                        {trip.distanceKm.toLocaleString('es-ES')} km
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="text-[#0058bc] dark:text-[#60a5fa] font-medium">
                        ⛽ ~{trip.estimatedFuelLiters} L diésel (~{trip.estimatedFuelCost} €)
                      </span>
                      {trip.excludeFromMonthlyRate && (
                        <span className="bg-[#006b27]/10 dark:bg-[#006b27]/20 text-[#006b27] dark:text-[#34d399] px-2 py-0.5 rounded-full font-semibold">
                          Media protegida
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateTrip} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                Motivo / Título del viaje
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Viaje a Madrid por trabajo, Vacaciones..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[13px] outline-none focus:ring-1 focus:ring-[#0058bc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                  Origen
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[13px] outline-none focus:ring-1 focus:ring-[#0058bc]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                  Destino
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Madrid, Pirineos..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[13px] outline-none focus:ring-1 focus:ring-[#0058bc]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                  Kilómetros (ida + vuelta)
                </label>
                <input
                  type="number"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[14px] font-bold outline-none focus:ring-1 focus:ring-[#0058bc]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7] block mb-1">
                  Fecha estimada
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#f4f3f8] dark:bg-[#262830] text-[13px] outline-none focus:ring-1 focus:ring-[#0058bc]"
                />
              </div>
            </div>

            {/* Switch to protect general metrics */}
            <div className="p-3 bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-[12px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8]">
                  No distorsionar medias mensuales
                </span>
                <span className="text-[10px] text-[#717786] dark:text-[#a2a7b7] leading-tight mt-0.5">
                  Mantiene tu ritmo base ({vehicle.monthlyKmRate} km/mes) y no altera el plan preventivo.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={excludeFromMonthlyRate}
                onClick={() => setExcludeFromMonthlyRate(!excludeFromMonthlyRate)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                  excludeFromMonthlyRate ? 'bg-[#008733]' : 'bg-[#e3e2e7] dark:bg-[#353846]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    excludeFromMonthlyRate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Fuel requirement estimate */}
            <div className="p-2.5 bg-[#fe9400]/10 rounded-xl border border-[#fe9400]/20 flex items-center justify-between text-[12px]">
              <span className="text-[#8c5000] dark:text-[#fbbf24] font-medium">
                Consumo estimado para {distNumber} km:
              </span>
              <span className="font-bold text-[#8c5000] dark:text-[#fbbf24]">
                ~{estimatedLiters} L ({estimatedCost.toFixed(2)} €)
              </span>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 h-10 rounded-full bg-[#eeedf3] dark:bg-[#2b2e39] text-[13px] font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-full bg-[#0058bc] text-white text-[13px] font-semibold shadow-sm hover:bg-[#004493]"
              >
                Guardar Viaje
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
