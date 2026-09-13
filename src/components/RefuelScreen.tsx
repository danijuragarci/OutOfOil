import React, { useState, useEffect, useRef } from 'react';
import { RefuelRecord, VehicleInfo, GasStation } from '../types';

interface RefuelScreenProps {
  vehicle: VehicleInfo;
  refuels: RefuelRecord[];
  onAddRefuel: (newRefuel: RefuelRecord) => void;
  preselectedStation?: GasStation | null;
  onClearPreselectedStation?: () => void;
}

export const RefuelScreen: React.FC<RefuelScreenProps> = ({
  vehicle,
  refuels,
  onAddRefuel,
  preselectedStation,
  onClearPreselectedStation,
}) => {
  // Current values
  const lastOdometer = vehicle.totalOdometer;
  const [odometer, setOdometer] = useState<number>(lastOdometer + 420);
  const [liters, setLiters] = useState<number>(42.5);
  const [pricePerLiter, setPricePerLiter] = useState<number>(
    preselectedStation?.pricePerLiter ?? 1.490
  );
  const [totalPrice, setTotalPrice] = useState<number>(
    Number((42.5 * (preselectedStation?.pricePerLiter ?? 1.490)).toFixed(2))
  );
  const [isFullTank, setIsFullTank] = useState<boolean>(true);
  const [selectedChip, setSelectedChip] = useState<string>('Lleno');

  // Station info
  const [stationName, setStationName] = useState<string>(
    preselectedStation ? `${preselectedStation.name} • ${preselectedStation.address}` : 'Repsol • A-7 km 14'
  );
  const [stationSubtitle, setStationSubtitle] = useState<string>(
    preselectedStation ? `${preselectedStation.distanceKm} km • ${preselectedStation.detourText}` : 'Autovía del Mediterráneo (Dir. Castellón)'
  );
  const [isChangingStation, setIsChangingStation] = useState<boolean>(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [ocrScanning, setOcrScanning] = useState<boolean>(false);

  // Ticket Receipt Photo State
  const [ticketPhoto, setTicketPhoto] = useState<string | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When preselectedStation changes from outside
  useEffect(() => {
    if (preselectedStation) {
      setStationName(`${preselectedStation.name} • ${preselectedStation.address}`);
      setStationSubtitle(`${preselectedStation.distanceKm} km • ${preselectedStation.detourText}`);
      setPricePerLiter(preselectedStation.pricePerLiter);
      setTotalPrice(Number((liters * preselectedStation.pricePerLiter).toFixed(2)));
    }
  }, [preselectedStation]);

  // Recalculations
  const tripKm = Math.max(0, odometer - lastOdometer);
  const computedConsumption =
    tripKm > 0 && liters > 0 ? Number(((liters / tripKm) * 100).toFixed(2)) : 5.12;
  const computedCostPerKm =
    tripKm > 0 && totalPrice > 0 ? Number((totalPrice / tripKm).toFixed(3)) : 0.076;

  // Compare price with previous refuel at the exact same station
  const baseCurrentStation = (stationName || '').split('•')[0].trim().toLowerCase();
  const previousRefuelAtSameStation = refuels.find((r) => {
    const rName = (r.stationName || '').toLowerCase();
    if (!rName || !baseCurrentStation) return false;
    return rName.includes(baseCurrentStation) || baseCurrentStation.includes(rName);
  });

  const priceDiffWithPrevious = previousRefuelAtSameStation
    ? Number((pricePerLiter - previousRefuelAtSameStation.pricePerLiter).toFixed(3))
    : null;

  // Handle file upload for receipt photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTicketPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Liters input change
  const handleLitersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(',', '.')) || 0;
    setLiters(val);
    setSelectedChip('');
    setTotalPrice(Number((val * pricePerLiter).toFixed(2)));
  };

  // Handle Price Per Liter change
  const handlePricePerLiterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(',', '.')) || 0;
    setPricePerLiter(val);
    setTotalPrice(Number((liters * val).toFixed(2)));
  };

  // Handle Total Price change
  const handleTotalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value.replace(',', '.')) || 0;
    setTotalPrice(val);
    if (liters > 0) {
      setPricePerLiter(Number((val / liters).toFixed(3)));
    }
  };

  // Quick Chips
  const handleApplyChip = (type: string) => {
    setSelectedChip(type);
    if (type === '+10L') {
      const newLiters = Number((liters + 10).toFixed(2));
      setLiters(newLiters);
      setTotalPrice(Number((newLiters * pricePerLiter).toFixed(2)));
    } else if (type === '+20L') {
      const newLiters = Number((liters + 20).toFixed(2));
      setLiters(newLiters);
      setTotalPrice(Number((newLiters * pricePerLiter).toFixed(2)));
    } else if (type === 'Lleno') {
      setIsFullTank(true);
      const fullLiters = 42.5;
      setLiters(fullLiters);
      setTotalPrice(Number((fullLiters * pricePerLiter).toFixed(2)));
    }
  };

  // Steppers for Odometer
  const incrementOdo = () => setOdometer((prev) => prev + 10);
  const decrementOdo = () => setOdometer((prev) => Math.max(lastOdometer, prev - 10));

  // OCR Simulator
  const triggerOcr = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setOdometer(lastOdometer + 450);
    }, 900);
  };

  // Submit refuel
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      const record: RefuelRecord = {
        id: `refuel-${Date.now()}`,
        date: 'Hoy',
        stationName: stationName.split('•')[0].trim(),
        address: stationSubtitle,
        liters: liters,
        pricePerLiter: pricePerLiter,
        totalPrice: totalPrice,
        odometer: odometer,
        isFullTank: isFullTank,
        tripKm: tripKm,
        computedConsumption: computedConsumption,
        computedCostPerKm: computedCostPerKm,
        ticketPhoto: ticketPhoto || undefined,
      };

      onAddRefuel(record);
      setIsSaving(false);
      setTicketPhoto(null);
      if (onClearPreselectedStation) onClearPreselectedStation();
    }, 600);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-24 space-y-4 text-[#1a1b1f] dark:text-[#f2f3f8]">
      {/* Lightbox Modal for Receipt Photo */}
      {viewingPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div
            className="relative max-w-sm w-full bg-white dark:bg-[#1f2129] rounded-2xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[13px] font-bold">Ticket de Suministro</span>
              <button
                type="button"
                onClick={() => setViewingPhotoUrl(null)}
                className="w-7 h-7 rounded-full bg-[#f4f3f8] dark:bg-[#2c2e39] flex items-center justify-center text-[#717786] hover:text-[#1a1b1f] dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <img
              src={viewingPhotoUrl}
              alt="Ticket del suministro"
              className="w-full max-h-[70vh] object-contain rounded-xl mt-2"
            />
          </div>
        </div>
      )}

      {/* Contextual Header & Vehicle Spec Chip */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#fe9400]/15 flex items-center justify-center text-[#8c5000] dark:text-[#f59e0b]">
              <span className="material-symbols-outlined text-[18px]">
                local_gas_station
              </span>
            </div>
            <h1 className="text-[20px] font-bold tracking-tight">
              Nuevo Repostaje
            </h1>
          </div>
          <span className="text-[11px] bg-[#e3e2e7] dark:bg-[#282b35] text-[#414755] dark:text-[#c1c6d7] px-2.5 py-1 rounded-full font-medium">
            Hoy, 18:42
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] bg-[#fe9400] text-white px-2.5 py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Diésel B7
          </span>
          <span className="text-[11px] text-[#414755] dark:text-[#c1c6d7] bg-[#eeedf3] dark:bg-[#242630] px-2.5 py-0.5 rounded-full shrink-0">
            Kia Cerato 1.6 CRDi (2006)
          </span>
          <span className="text-[11px] text-[#006b27] dark:text-[#34d399] bg-[#008733]/15 px-2 py-0.5 rounded-full font-semibold shrink-0">
            Depósito: 53L
          </span>
        </div>
      </div>

      {/* Smart GPS Gas Station Detection Banner */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl p-3.5 shadow-sm flex flex-col gap-2 border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                share_location
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold truncate">
                  {stationName}
                </span>
                <span className="text-[10px] bg-[#006b27]/10 text-[#006b27] dark:text-[#34d399] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 shrink-0">
                  <span className="material-symbols-outlined text-[10px]">near_me</span>{' '}
                  GPS
                </span>
              </div>
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] truncate">
                {stationSubtitle}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChangingStation(!isChangingStation)}
            className="text-[#0058bc] dark:text-[#60a5fa] text-[12px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#f4f3f8] dark:bg-[#282b35] active:scale-95 transition-all shrink-0"
          >
            {isChangingStation ? 'Listo' : 'Cambiar'}
          </button>
        </div>

        {/* COMPARATIVA CON EL ÚLTIMO REPOSTAJE EN ESTA MISMA GASOLINERA */}
        <div className="mt-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
          <span className="text-[#717786] dark:text-[#a2a7b7] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
            Comparativa estación previa:
          </span>

          {previousRefuelAtSameStation && priceDiffWithPrevious !== null ? (
            priceDiffWithPrevious < -0.001 ? (
              <span className="bg-[#006b27]/10 dark:bg-[#006b27]/25 text-[#006b27] dark:text-[#34d399] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>↓ Más barata</span>
                <span>({Math.abs(priceDiffWithPrevious).toFixed(3).replace('.', ',')} €/L menos que el {previousRefuelAtSameStation.date})</span>
              </span>
            ) : priceDiffWithPrevious > 0.001 ? (
              <span className="bg-[#ba1a1a]/10 dark:bg-[#ba1a1a]/25 text-[#ba1a1a] dark:text-[#f87171] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>↑ Más cara</span>
                <span>(+{priceDiffWithPrevious.toFixed(3).replace('.', ',')} €/L más que el {previousRefuelAtSameStation.date})</span>
              </span>
            ) : (
              <span className="bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>= Igual de precio</span>
                <span>({previousRefuelAtSameStation.pricePerLiter.toFixed(3).replace('.', ',')} €/L)</span>
              </span>
            )
          ) : (
            <span className="text-[#717786] dark:text-[#a2a7b7] italic">
              Primera vez en esta estación
            </span>
          )}
        </div>
      </div>

      {/* Optional Station Picker Selector when user clicks 'Cambiar' */}
      {isChangingStation && (
        <div className="bg-white dark:bg-[#1c1d24] p-3 rounded-2xl shadow-sm border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2 animate-in fade-in duration-200">
          <span className="text-[12px] font-semibold text-[#414755] dark:text-[#c1c6d7]">
            Seleccionar gasolinera cercana:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Repsol • A-7 km 14', sub: 'Autovía del Mediterráneo', p: 1.490 },
              { name: 'Plenoil • Severo Ochoa', sub: 'A 1,8 km (Low Cost)', p: 1.419 },
              { name: 'Ballenoil • Polígono Norte', sub: 'A 2,4 km', p: 1.425 },
              { name: 'Cepsa • Ronda Norte', sub: 'A 0,9 km', p: 1.479 },
            ].map((st) => (
              <button
                key={st.name}
                type="button"
                onClick={() => {
                  setStationName(st.name);
                  setStationSubtitle(st.sub);
                  setPricePerLiter(st.p);
                  setTotalPrice(Number((liters * st.p).toFixed(2)));
                  setIsChangingStation(false);
                }}
                className="text-left p-2 rounded-xl bg-[#f4f3f8] dark:bg-[#282b35] hover:bg-[#eeedf3] dark:hover:bg-[#313542] active:scale-95 transition-all"
              >
                <div className="text-[12px] font-bold truncate">
                  {st.name}
                </div>
                <div className="text-[11px] text-[#006b27] dark:text-[#34d399] font-semibold">
                  {st.p.toFixed(3).replace('.', ',')} €/L
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Section: Odometer */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#717786] dark:text-[#a2a7b7] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#0058bc] dark:text-[#60a5fa]">
              speed
            </span>
            Odómetro Actual
          </span>
          <div className="flex items-center gap-1 text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25 px-2 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[13px]">
              trending_up
            </span>
            <span className="text-[11px] font-semibold">
              +{tripKm} km tramo
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between bg-[#f4f3f8] dark:bg-[#242630] px-4 py-3 rounded-2xl">
          <div className="flex items-baseline gap-1">
            <input
              type="text"
              id="odometer-input"
              value={odometer.toLocaleString('es-ES')}
              onChange={(e) => {
                const cleaned = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                setOdometer(cleaned);
              }}
              className="text-[28px] font-bold text-[#1a1b1f] dark:text-white bg-transparent outline-none w-44 tracking-tight p-0"
            />
            <span className="text-[20px] text-[#717786] dark:text-[#a2a7b7] font-medium">km</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={decrementOdo}
              title="Restar 10 km"
              className="w-8 h-8 rounded-full bg-[#e3e2e7] dark:bg-[#323644] text-[#1a1b1f] dark:text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <button
              type="button"
              onClick={incrementOdo}
              title="Sumar 10 km"
              className="w-8 h-8 rounded-full bg-[#e3e2e7] dark:bg-[#323644] text-[#1a1b1f] dark:text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
            Último guardado:{' '}
            <strong className="text-[#1a1b1f] dark:text-white font-semibold">
              {lastOdometer.toLocaleString('es-ES')} km
            </strong>
          </span>
          <button
            type="button"
            onClick={triggerOcr}
            className="text-[11px] text-[#0058bc] dark:text-[#60a5fa] font-medium cursor-pointer flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-[15px]">
              {ocrScanning ? 'sync' : 'photo_camera'}
            </span>
            <span>{ocrScanning ? 'Escaneando...' : 'OCR Cuadro'}</span>
          </button>
        </div>
      </div>

      {/* Liters, Price & Full Tank Form Card */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm flex flex-col gap-4 border border-black/[0.03] dark:border-white/[0.05]">
        {/* Volume */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="liters-input"
              className="text-[11px] uppercase tracking-wider text-[#717786] dark:text-[#a2a7b7] font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-[#fe9400]">
                opacity
              </span>
              Litros Repostados
            </label>
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium">
              Capacidad restante: ~{(vehicle.tankCapacity - liters).toFixed(1)} L
            </span>
          </div>

          <div className="flex items-baseline justify-between bg-[#f4f3f8] dark:bg-[#242630] px-4 py-3 rounded-2xl">
            <div className="flex items-baseline gap-1">
              <input
                id="liters-input"
                type="text"
                value={liters.toString().replace('.', ',')}
                onChange={handleLitersChange}
                className="text-[28px] font-bold text-[#1a1b1f] dark:text-white bg-transparent outline-none w-32 tracking-tight p-0"
              />
              <span className="text-[20px] text-[#fe9400] font-semibold">L</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyChip('+10L')}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all ${
                  selectedChip === '+10L'
                    ? 'bg-[#fe9400] text-white shadow-sm'
                    : 'bg-[#e3e2e7] dark:bg-[#323644] text-[#1a1b1f] dark:text-white'
                }`}
              >
                +10L
              </button>
              <button
                type="button"
                onClick={() => handleApplyChip('+20L')}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all ${
                  selectedChip === '+20L'
                    ? 'bg-[#fe9400] text-white shadow-sm'
                    : 'bg-[#e3e2e7] dark:bg-[#323644] text-[#1a1b1f] dark:text-white'
                }`}
              >
                +20L
              </button>
              <button
                type="button"
                onClick={() => handleApplyChip('Lleno')}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm ${
                  selectedChip === 'Lleno'
                    ? 'bg-[#fe9400] text-white'
                    : 'bg-[#e3e2e7] dark:bg-[#323644] text-[#1a1b1f] dark:text-white'
                }`}
              >
                Lleno
              </button>
            </div>
          </div>
        </div>

        {/* Dual Total & Price per Liter */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 bg-[#f4f3f8] dark:bg-[#242630] p-3 rounded-2xl">
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium">
              Importe Total
            </span>
            <div className="flex items-baseline gap-1">
              <input
                id="total-price-input"
                type="text"
                value={totalPrice.toFixed(2).replace('.', ',')}
                onChange={handleTotalPriceChange}
                className="text-[20px] font-bold text-[#1a1b1f] dark:text-white bg-transparent outline-none w-24 tracking-tight p-0"
              />
              <span className="text-[13px] font-bold text-[#1a1b1f] dark:text-white">€</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 bg-[#f4f3f8] dark:bg-[#242630] p-3 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium">
                Precio Unitario
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <input
                id="price-per-liter-input"
                type="text"
                value={pricePerLiter.toFixed(3).replace('.', ',')}
                onChange={handlePricePerLiterChange}
                className="text-[20px] font-bold text-[#006b27] dark:text-[#34d399] bg-transparent outline-none w-24 tracking-tight p-0"
              />
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium">€/L</span>
            </div>
          </div>
        </div>

        {/* Native iOS Switch: Full Tank Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col pr-3">
            <span className="text-[15px] font-semibold text-[#1a1b1f] dark:text-white">
              ¿Depósito Lleno?
            </span>
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
              Recomendado para calcular el consumo medio exacto
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isFullTank}
            onClick={() => setIsFullTank(!isFullTank)}
            className={`w-[51px] h-[31px] rounded-full p-0.5 transition-colors relative shrink-0 shadow-inner ${
              isFullTank ? 'bg-[#008733]' : 'bg-[#e3e2e7] dark:bg-[#323644]'
            }`}
          >
            <div
              className={`w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform duration-200 ${
                isFullTank ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* FOTOGRAFÍA DEL TICKET DE SUMINISTRO (User requirement) */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#717786] dark:text-[#a2a7b7] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#0058bc] dark:text-[#60a5fa]">
              receipt_long
            </span>
            Ticket del Suministro
          </span>
          {ticketPhoto && (
            <span className="text-[10px] font-bold bg-[#006b27]/10 text-[#006b27] dark:text-[#34d399] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">check</span> Foto adjuntada
            </span>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {ticketPhoto ? (
          <div className="relative rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] bg-[#f4f3f8] dark:bg-[#242630] p-2 flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => setViewingPhotoUrl(ticketPhoto)}
            >
              <img
                src={ticketPhoto}
                alt="Ticket preview"
                className="w-14 h-14 object-cover rounded-lg shadow-xs"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold truncate">Ticket adjunto</span>
                <span className="text-[11px] text-[#0058bc] dark:text-[#60a5fa] font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">zoom_in</span>
                  Toca para ampliar
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2c2e39] text-[#1a1b1f] dark:text-white border border-black/[0.06] dark:border-white/[0.08] shadow-xs active:scale-95"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => setTicketPhoto(null)}
                className="w-8 h-8 rounded-lg bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center active:scale-95"
                title="Eliminar foto"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black/[0.08] dark:border-white/[0.12] hover:border-[#0058bc] dark:hover:border-[#60a5fa] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer bg-[#faf9fe] dark:bg-[#21232c] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            </div>
            <span className="text-[13px] font-bold">Añadir foto del ticket</span>
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
              Sube una foto o tómala con la cámara para guardar el comprobante
            </span>
          </div>
        )}
      </div>

      {/* Live Telemetry & Computed Analytics Preview */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006b27] dark:text-[#34d399]">
              insights
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#717786] dark:text-[#a2a7b7] font-semibold">
              Análisis en Directo
            </span>
          </div>
          <span className="text-[11px] text-[#006b27] dark:text-[#34d399] font-semibold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">
              check_circle
            </span>{' '}
            Calculado
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Metric 1: Consumo */}
          <div className="p-3 bg-[#f4f3f8] dark:bg-[#242630] rounded-2xl flex flex-col gap-0.5">
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">Consumo del tramo</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-bold">
                {computedConsumption.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">L/100km</span>
            </div>
            <span className="text-[11px] text-[#006b27] dark:text-[#34d399] font-medium flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">south</span>{' '}
              -0,28 L vs media habitual
            </span>
          </div>

          {/* Metric 2: Coste */}
          <div className="p-3 bg-[#f4f3f8] dark:bg-[#242630] rounded-2xl flex flex-col gap-0.5">
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">Coste por kilómetro</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-bold">
                {computedCostPerKm.toFixed(3).replace('.', ',')}
              </span>
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">€/km</span>
            </div>
            <span className="text-[11px] text-[#8c5000] dark:text-[#f59e0b] font-medium mt-0.5">
              Ahorro de ~2,40 € en el tramo
            </span>
          </div>
        </div>

        {/* Maintenance decrement projection pill */}
        <div className="flex items-center gap-2.5 p-2.5 bg-[#e9e7ed] dark:bg-[#282b35] rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a1b20] flex items-center justify-center text-[#0058bc] dark:text-[#60a5fa] shrink-0">
            <span className="material-symbols-outlined text-[16px]">
              oil_barrel
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold truncate">
                Próximo cambio aceite 5W30
              </span>
              <span className="text-[11px] font-bold">
                {Math.max(0, 2450 - tripKm).toLocaleString('es-ES')} km
              </span>
            </div>
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
              Descontados {tripKm} km de este intervalo
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action CTA Button */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          id="submit-refuel-btn"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full h-12 rounded-2xl bg-[#fe9400] hover:bg-[#e08300] active:scale-[0.98] text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(254,148,0,0.35)] transition-all"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">
                sync
              </span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">check</span>
              <span>Guardar Repostaje</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-[#717786] dark:text-[#a2a7b7]">
          Los datos actualizarán la autonomía proyectada y el informe mensual.
        </p>
      </div>

      {/* Recent Refuel History Mini Accordion */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-black/[0.03] dark:border-white/[0.05]">
        <button
          type="button"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="flex items-center justify-between cursor-pointer w-full text-left"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#717786] dark:text-[#a2a7b7]">
              history
            </span>
            <span className="text-[14px] font-semibold">
              Últimos Repostajes
            </span>
            <span className="text-[11px] bg-[#eeedf3] dark:bg-[#282b35] px-2 py-0.5 rounded-full text-[#717786] dark:text-[#a2a7b7] font-medium">
              {refuels.length}
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[#717786] dark:text-[#a2a7b7] text-[20px] transition-transform duration-200 ${
              isHistoryExpanded ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {isHistoryExpanded && (
          <div className="flex flex-col gap-2 pt-1">
            {refuels.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#f4f3f8] dark:bg-[#242630] hover:bg-[#eeedf3] dark:hover:bg-[#2c2f3c] transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold truncate">
                      {r.stationName}
                    </span>
                    <span className="text-[10px] text-[#717786] dark:text-[#a2a7b7] bg-[#eeedf3] dark:bg-[#2c2f3c] px-1.5 py-0.5 rounded">
                      {r.date}
                    </span>
                    {r.ticketPhoto && (
                      <button
                        type="button"
                        onClick={() => setViewingPhotoUrl(r.ticketPhoto || null)}
                        className="text-[10px] font-bold text-[#0058bc] dark:text-[#60a5fa] bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 hover:underline"
                        title="Ver ticket adjunto"
                      >
                        <span className="material-symbols-outlined text-[11px]">receipt</span>
                        Ticket
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] mt-0.5">
                    {r.liters.toFixed(2).replace('.', ',')} L •{' '}
                    {r.pricePerLiter.toFixed(3).replace('.', ',')} €/L •{' '}
                    {r.odometer.toLocaleString('es-ES')} km
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[14px] font-bold">
                    {r.totalPrice.toFixed(2).replace('.', ',')} €
                  </span>
                  {r.computedConsumption && (
                    <span className="text-[11px] text-[#006b27] dark:text-[#34d399] font-medium">
                      {r.computedConsumption.toFixed(2).replace('.', ',')} L/100km
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

