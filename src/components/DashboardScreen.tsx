import React, { useState } from 'react';
import { VehicleInfo, RefuelRecord, MaintenanceState, TabType, PlannedTrip } from '../types';
import { consumptionTrendData } from '../initialData';

interface DashboardScreenProps {
  vehicle: VehicleInfo;
  refuels: RefuelRecord[];
  maintenance: MaintenanceState;
  trips: PlannedTrip[];
  onOpenTripsModal: () => void;
  onToggleCompleteTrip: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  vehicle,
  refuels,
  maintenance,
  trips,
  onOpenTripsModal,
  onToggleCompleteTrip,
  onNavigateTab,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(5);
  // Calculation window for estimated range: 3 or 6 months
  const [autonomyMonthsWindow, setAutonomyMonthsWindow] = useState<3 | 6>(3);

  // Calculate oil remaining
  const oilRemaining = Math.max(0, maintenance.oilIntervalKm - maintenance.oilCycleKm);

  // Calculate dynamic average consumption of the last months (User Requirement)
  const windowSlice = consumptionTrendData.slice(-autonomyMonthsWindow);
  const avgRecentMonthsConsumption = Number(
    (
      windowSlice.reduce((acc, curr) => acc + curr.consumption, 0) /
      windowSlice.length
    ).toFixed(2)
  );

  // Calculated dynamic range: (currentLiters / avgConsumption) * 100
  const calculatedEstimatedRange = Math.round(
    (vehicle.currentLiters / avgRecentMonthsConsumption) * 100
  );

  // Active trips
  const activeTrips = trips.filter((t) => !t.isCompleted);

  // Points coordinates mapped for SVG 320 x 120
  // X steps: 0, 64, 128, 192, 256, 320
  const consumptionPoints = [
    { x: 0, y: 75, val: '5.8' },
    { x: 64, y: 60, val: '5.6' },
    { x: 128, y: 80, val: '5.9' },
    { x: 192, y: 50, val: '5.3' },
    { x: 256, y: 65, val: '5.7' },
    { x: 320, y: 45, val: '5.4' },
  ];

  const pricePoints = [
    { x: 0, y: 85, val: '1.44' },
    { x: 64, y: 78, val: '1.48' },
    { x: 128, y: 82, val: '1.46' },
    { x: 192, y: 72, val: '1.49' },
    { x: 256, y: 62, val: '1.51' },
    { x: 320, y: 68, val: '1.49' },
  ];

  const latestRefuel = refuels[0];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-24 space-y-4 text-[#1a1b1f] dark:text-[#f2f3f8]">
      {/* Top Hero Status Card: Vehicle Overview & Tank Gauge */}
      <div
        id="hero-vehicle-card"
        className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-4 overflow-hidden relative border border-black/[0.03] dark:border-white/[0.05]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#006b27] dark:bg-[#34d399]" />
              <span className="text-[11px] text-[#006b27] dark:text-[#34d399] font-bold uppercase tracking-wider">
                Operativo
              </span>
            </div>
            <h2 className="text-[22px] font-bold leading-snug mt-0.5 tracking-tight">
              {vehicle.modelName}
            </h2>
            <span className="text-[13px] text-[#717786] dark:text-[#a2a7b7] font-medium">
              {vehicle.version}
            </span>
          </div>

          {/* Odometer pill badge */}
          <div className="inline-flex items-center gap-1 bg-[#eeedf3] dark:bg-[#282b35] px-2.5 py-1 rounded-full shrink-0">
            <span className="material-symbols-outlined text-[16px] text-[#0058bc] dark:text-[#60a5fa]">
              speed
            </span>
            <span className="text-[12px] font-bold tracking-tight">
              {vehicle.totalOdometer.toLocaleString('es-ES')} km
            </span>
          </div>
        </div>

        {/* Telemetry Main Metric: Autonomía Dinámica (User Requirement) & Tanque */}
        <div className="mt-4 pt-1 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-medium">
                Autonomía estimada
              </span>
              {/* Toggle 3M / 6M */}
              <div className="inline-flex items-center bg-[#f4f3f8] dark:bg-[#282b35] rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setAutonomyMonthsWindow(3)}
                  className={`px-1.5 py-0.5 rounded ${
                    autonomyMonthsWindow === 3
                      ? 'bg-white dark:bg-[#3b82f6] text-[#0058bc] dark:text-white shadow-xs'
                      : 'text-[#717786] dark:text-[#a2a7b7]'
                  }`}
                  title="Calcular según media de los últimos 3 meses"
                >
                  3m
                </button>
                <button
                  type="button"
                  onClick={() => setAutonomyMonthsWindow(6)}
                  className={`px-1.5 py-0.5 rounded ${
                    autonomyMonthsWindow === 6
                      ? 'bg-white dark:bg-[#3b82f6] text-[#0058bc] dark:text-white shadow-xs'
                      : 'text-[#717786] dark:text-[#a2a7b7]'
                  }`}
                  title="Calcular según media de los últimos 6 meses"
                >
                  6m
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[44px] leading-none font-extrabold tracking-tight">
                {calculatedEstimatedRange}
              </span>
              <span className="text-[20px] text-[#717786] dark:text-[#a2a7b7] font-bold">km</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7]">Capacidad</span>
            <p className="text-[20px] font-bold leading-tight mt-0.5">
              {vehicle.currentLiters}L{' '}
              <span className="text-[14px] text-[#717786] dark:text-[#a2a7b7] font-normal">
                / {vehicle.tankCapacity}L
              </span>
            </p>
          </div>
        </div>

        {/* Dynamic range calculation explanation footnote */}
        <div className="mt-2 text-[11px] text-[#717786] dark:text-[#a2a7b7] bg-[#f4f3f8] dark:bg-[#242630] px-2.5 py-1.5 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#006b27] dark:text-[#34d399]">
              functions
            </span>
            <span>
              Media {autonomyMonthsWindow} meses:{' '}
              <strong className="text-[#1a1b1f] dark:text-white font-semibold">
                {avgRecentMonthsConsumption.toFixed(2).replace('.', ',')} L/100km
              </strong>
            </span>
          </span>
          <span className="text-[10px] text-[#0058bc] dark:text-[#60a5fa] font-semibold">
            {vehicle.currentLiters}L ÷ {avgRecentMonthsConsumption}L/100
          </span>
        </div>

        {/* Segmented Fuel Gauge Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-semibold">
              Nivel de combustible
            </span>
            <span className="text-[12px] text-[#0058bc] dark:text-[#60a5fa] font-bold">
              {vehicle.fuelPercentage}%
            </span>
          </div>

          <div className="w-full h-3 bg-[#eeedf3] dark:bg-[#2c2e39] rounded-full overflow-hidden p-0.5 flex gap-1">
            <div
              className="h-full rounded-full bg-[#0058bc] dark:bg-[#3b82f6] transition-all duration-700 ease-out"
              style={{ width: `${vehicle.fuelPercentage}%` }}
            />
            <div className="h-full rounded-full bg-[#e9e7ed] dark:bg-[#20222b] flex-1" />
          </div>

          <div className="flex justify-between items-center mt-1 text-[#717786] dark:text-[#a2a7b7] text-[11px] font-medium px-0.5">
            <span>R</span>
            <span>1/2</span>
            <span>1/1</span>
          </div>
        </div>
      </div>

      {/* Key Metrics 2x2 Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Coste por Kilómetro */}
        <div className="bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-3.5 flex flex-col justify-between border border-black/[0.03] dark:border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-semibold">
              Coste / km
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#0058bc] dark:text-[#60a5fa]">
              euro_symbol
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-[26px] font-bold tracking-tight leading-none">
              {vehicle.costPerKm.toFixed(3).replace('.', ',')}
              <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-medium ml-1">
                €/km
              </span>
            </p>
            <div className="inline-flex items-center gap-0.5 mt-1.5 text-[#006b27] dark:text-[#34d399] font-semibold text-[11px]">
              <span className="material-symbols-outlined text-[14px]">
                trending_down
              </span>
              <span>-0,004 € vs mes ant.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Consumo Medio */}
        <div className="bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-3.5 flex flex-col justify-between border border-black/[0.03] dark:border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-semibold">
              Consumo medio
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#fe9400] dark:text-[#f59e0b]">
              local_gas_station
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-[26px] font-bold tracking-tight leading-none">
              {avgRecentMonthsConsumption.toFixed(1).replace('.', ',')}
              <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-medium ml-1">
                L/100
              </span>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe9400] dark:bg-[#f59e0b]" />
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium truncate">
                Últimos {autonomyMonthsWindow} meses
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Último Repostaje */}
        <div className="bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-3.5 flex flex-col justify-between border border-black/[0.03] dark:border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-semibold">
              Último repostaje
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#0058bc] dark:text-[#60a5fa]">
              history
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-[26px] font-bold tracking-tight leading-none">
              {latestRefuel?.tripKm || vehicle.lastRefuelTrip}
              <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-medium ml-1">
                km
              </span>
            </p>
            <div className="flex justify-between items-baseline mt-1.5 text-[11px] text-[#717786] dark:text-[#a2a7b7]">
              <span>Hace {vehicle.lastRefuelDaysAgo} días</span>
              <span className="font-bold text-[#1a1b1f] dark:text-white">
                {(latestRefuel?.totalPrice || vehicle.lastRefuelCost)
                  .toFixed(2)
                  .replace('.', ',')}{' '}
                €
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Gasto este Mes */}
        <div className="bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-3.5 flex flex-col justify-between border border-black/[0.03] dark:border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-semibold">
              Gasto este mes
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#006b27] dark:text-[#34d399]">
              account_balance_wallet
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-[26px] font-bold tracking-tight leading-none">
              {vehicle.monthlyExpense.toFixed(2).replace('.', ',')}
              <span className="text-[14px] text-[#717786] dark:text-[#a2a7b7] font-medium ml-0.5">
                €
              </span>
            </p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                {vehicle.monthlyLiters} L
              </span>
              <span className="text-[10px] font-semibold text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25 px-1.5 py-0.5 rounded">
                En ppto.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PLANIFICADOR DE VIAJES (User Requirement: Viajes sin alterar medias generales) */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-4 flex flex-col gap-3 border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                route
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-bold tracking-tight">
                  Viajes Programados
                </h3>
                <span className="text-[10px] font-bold bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] px-1.5 py-0.5 rounded-full">
                  {activeTrips.length}
                </span>
              </div>
              <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                Tramos largos aislados de tus medias habituales
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTripsModal}
            className="text-[12px] font-bold text-[#0058bc] dark:text-[#60a5fa] bg-[#f4f3f8] dark:bg-[#282b35] hover:bg-[#eeedf3] px-3 py-1.5 rounded-xl active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Planificar</span>
          </button>
        </div>

        {activeTrips.length > 0 ? (
          <div className="flex flex-col gap-2">
            {activeTrips.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-[#f4f3f8] dark:bg-[#242630] rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold truncate">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-[#006b27] dark:text-[#34d399] bg-[#006b27]/10 dark:bg-[#006b27]/25 font-semibold px-1.5 py-0.2 rounded-full">
                      Sin alterar medias
                    </span>
                  </div>
                  <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] mt-0.5">
                    {t.origin} → {t.destination} • {t.distanceKm} km • Previsto: {t.date}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[13px] font-bold block">
                      ~{t.estimatedFuelCost} €
                    </span>
                    <span className="text-[10px] text-[#717786] dark:text-[#a2a7b7]">
                      {t.estimatedFuelLiters} L
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleCompleteTrip(t.id)}
                    title="Marcar como realizado"
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#323644] text-[#006b27] dark:text-[#34d399] flex items-center justify-center shadow-xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={onOpenTripsModal}
            className="p-3 bg-[#f4f3f8] dark:bg-[#242630] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#eeedf3] dark:hover:bg-[#2b2e3a] transition-colors"
          >
            <div className="flex items-center gap-2 text-[12px] text-[#717786] dark:text-[#a2a7b7]">
              <span className="material-symbols-outlined text-[18px] text-[#0058bc] dark:text-[#60a5fa]">
                luggage
              </span>
              <span>¿Vas a hacer un viaje largo? Planifícalo aquí</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#717786]">
              chevron_right
            </span>
          </div>
        )}
      </div>

      {/* Primary Action: Quick Refuel Trigger */}
      <button
        id="quick-refuel-btn"
        onClick={() => onNavigateTab('repostar')}
        className="w-full h-12 bg-[#fe9400] hover:bg-[#e08300] active:scale-[0.98] transition-all duration-150 rounded-2xl shadow-[0_4px_16px_rgba(254,148,0,0.3)] flex items-center justify-center gap-2 text-white font-bold text-[16px]"
      >
        <span className="material-symbols-outlined text-[22px]">
          local_gas_station
        </span>
        <span>Registrar Repostaje</span>
      </button>

      {/* Visual Delight: Consumption & Price SVG Graph */}
      <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm p-4 flex flex-col border border-black/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-[18px] font-bold tracking-tight">
              Evolución de Consumo y Precio
            </h3>
            <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
              Últimos 6 repostajes completos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0058bc] dark:bg-[#60a5fa]" />
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium">
                L/100km
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fe9400] dark:bg-[#f59e0b]" />
              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] font-medium">€/L</span>
            </div>
          </div>
        </div>

        {/* Dynamic SVG Line Chart */}
        <div className="relative w-full h-36 pt-2 select-none">
          <svg
            className="w-full h-full overflow-visible"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 320 120"
          >
            <defs>
              <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0058bc" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0058bc" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Guide Lines */}
            <line
              stroke="currentColor"
              className="text-black/5 dark:text-white/10"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1="0"
              x2="320"
              y1="20"
              y2="20"
            />
            <line
              stroke="currentColor"
              className="text-black/5 dark:text-white/10"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1="0"
              x2="320"
              y1="60"
              y2="60"
            />
            <line
              stroke="currentColor"
              className="text-black/5 dark:text-white/10"
              strokeWidth="1"
              x1="0"
              x2="320"
              y1="100"
              y2="100"
            />

            {/* Blue Fill Area for L/100km */}
            <polygon
              fill="url(#blueGradient)"
              points="0,75 64,60 128,80 192,50 256,65 320,45 320,110 0,110"
            />

            {/* Blue Line: L/100 km */}
            <polyline
              points="0,75 64,60 128,80 192,50 256,65 320,45"
              stroke="#0058bc"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {/* Orange Line: Price €/L */}
            <polyline
              points="0,85 64,78 128,82 192,72 256,62 320,68"
              stroke="#fe9400"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
            />

            {/* Interactive Data points */}
            {consumptionPoints.map((pt, idx) => (
              <circle
                key={`c-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={selectedPointIndex === idx ? 5.5 : 3.5}
                fill={selectedPointIndex === idx ? '#0058bc' : '#ffffff'}
                stroke="#0058bc"
                strokeWidth={selectedPointIndex === idx ? 2.5 : 2}
                className="cursor-pointer transition-all hover:scale-125"
                onClick={() => setSelectedPointIndex(idx)}
              />
            ))}

            {pricePoints.map((pt, idx) => (
              <circle
                key={`p-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={selectedPointIndex === idx ? 5 : 3.5}
                fill="#fe9400"
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:scale-125"
                onClick={() => setSelectedPointIndex(idx)}
              />
            ))}
          </svg>

          {/* Chart X Axis Labels */}
          <div className="flex justify-between items-center mt-2 px-0.5 text-[#717786] dark:text-[#a2a7b7] text-[11px]">
            {consumptionTrendData.map((d, i) => (
              <button
                key={d.label}
                onClick={() => setSelectedPointIndex(i)}
                className={`transition-colors ${
                  selectedPointIndex === i
                    ? 'font-bold text-[#1a1b1f] dark:text-white'
                    : 'hover:text-[#1a1b1f] dark:hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Callout Footnote */}
        <div className="mt-3 pt-2 bg-[#f4f3f8] dark:bg-[#242630] rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <span className="material-symbols-outlined text-[18px] text-[#006b27] dark:text-[#34d399] shrink-0">
              check_circle
            </span>
            <span className="text-[12px] font-medium truncate">
              {selectedPointIndex !== null && consumptionTrendData[selectedPointIndex]
                ? `${consumptionTrendData[selectedPointIndex].label}: ${consumptionTrendData[selectedPointIndex].consumption} L/100km • ${consumptionTrendData[selectedPointIndex].price} €/L`
                : 'Consumo óptimo: -0,3 L/100km respecto a febrero'}
            </span>
          </div>
          <span className="text-[12px] text-[#0058bc] dark:text-[#60a5fa] font-bold shrink-0">
            {selectedPointIndex !== null && consumptionTrendData[selectedPointIndex]
              ? `${consumptionTrendData[selectedPointIndex].price} €/L`
              : '1,49 €/L'}
          </span>
        </div>
      </div>

      {/* iOS Grouped List Style: Vehicle Maintenance & Critical Reminders */}
      <div className="flex flex-col space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#717786] dark:text-[#a2a7b7] px-1">
          Alertas y Mantenimiento
        </span>

        <div className="w-full bg-white dark:bg-[#1c1d24] rounded-2xl shadow-sm overflow-hidden border border-black/[0.03] dark:border-white/[0.05]">
          {/* List Item 1: Próximo Cambio de Aceite */}
          <div
            onClick={() => onNavigateTab('taller')}
            className="flex items-center px-4 py-3.5 active:bg-[#f4f3f8] dark:active:bg-[#242630] cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#ffdcbf] dark:bg-[#ffdcbf]/20 flex items-center justify-center text-[#6a3b00] dark:text-[#ffb77c] shrink-0 mr-3">
              <span className="material-symbols-outlined text-[20px]">
                oil_barrel
              </span>
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold truncate">
                  Cambio de Aceite (5W-30)
                </span>
                <span className="text-[11px] text-[#8c5000] dark:text-[#f59e0b] font-bold shrink-0">
                  En {oilRemaining.toLocaleString('es-ES')} km
                </span>
              </div>
              <p className="text-[12px] text-[#717786] dark:text-[#a2a7b7] truncate mt-0.5">
                Filtro de aceite y revisión 15.000 km • {maintenance.oilEstimatedDate}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#c1c6d7] dark:text-[#525769] shrink-0">
              chevron_right
            </span>
          </div>

          <div className="h-[0.5px] bg-[#e3e2e7] dark:bg-[#2a2d39] ml-14" />

          {/* List Item 2: ITV en Regla */}
          <div
            onClick={() => onNavigateTab('taller')}
            className="flex items-center px-4 py-3.5 active:bg-[#f4f3f8] dark:active:bg-[#242630] cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#72fe88]/40 dark:bg-[#00531c]/30 flex items-center justify-center text-[#00531c] dark:text-[#34d399] shrink-0 mr-3">
              <span className="material-symbols-outlined text-[20px]">
                verified_user
              </span>
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold truncate">
                  Inspección Técnica (ITV)
                </span>
                <span className="text-[11px] text-[#006b27] dark:text-[#34d399] font-semibold shrink-0">
                  Faltan {Math.round(maintenance.itvDaysRemaining / 30)} meses
                </span>
              </div>
              <p className="text-[12px] text-[#717786] dark:text-[#a2a7b7] truncate mt-0.5">
                Válida hasta el {maintenance.itvValidUntil}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#c1c6d7] dark:text-[#525769] shrink-0">
              chevron_right
            </span>
          </div>

          <div className="h-[0.5px] bg-[#e3e2e7] dark:bg-[#2a2d39] ml-14" />

          {/* List Item 3: Seguro */}
          <div
            onClick={() => onNavigateTab('taller')}
            className="flex items-center px-4 py-3.5 active:bg-[#f4f3f8] dark:active:bg-[#242630] cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#d8e2ff] dark:bg-[#004493]/30 flex items-center justify-center text-[#004493] dark:text-[#60a5fa] shrink-0 mr-3">
              <span className="material-symbols-outlined text-[20px]">policy</span>
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold truncate">
                  Seguro {maintenance.insuranceCompany} ({maintenance.insurancePaymentFrequency || 'anual'})
                </span>
                <span className="text-[11px] text-[#0058bc] dark:text-[#60a5fa] font-semibold shrink-0">
                  En {maintenance.insuranceDaysRemaining} días
                </span>
              </div>
              <p className="text-[12px] text-[#717786] dark:text-[#a2a7b7] truncate mt-0.5">
                {maintenance.insuranceInstallmentCost
                  ? `${maintenance.insuranceInstallmentCost.toFixed(2)} € / cuota • Renovación: ${maintenance.insuranceRenewDate}`
                  : `Prima prevista ${maintenance.insurancePremium.toFixed(2)} € • ${maintenance.insuranceRenewDate}`}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#c1c6d7] dark:text-[#525769] shrink-0">
              chevron_right
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

