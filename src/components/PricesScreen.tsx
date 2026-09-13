import React, { useState } from 'react';
import { GasStation, UserLocation, GPSStatus } from '../types';
import { MAP_IMAGE_URL } from '../initialData';
import { PriceHistoryModal } from './PriceHistoryModal';

interface PricesScreenProps {
  stations: GasStation[];
  favoriteStationIds?: string[];
  onToggleFavorite?: (stationId: string) => void;
  onSelectStationToRefuel: (station: GasStation) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  userLocation: UserLocation;
  gpsStatus: GPSStatus;
  onRequestLocation: (opts?: { userInitiated?: boolean }) => Promise<UserLocation | null>;
  isPermissionDenied: boolean;
  isLastKnown: boolean;
  isLoadingStations?: boolean;
  onSetManualLocation?: (lat: number, lng: number, city: string, address?: string) => void;
}

type FilterOption = 'cheapest' | 'closest' | 'detour';

const POPULAR_CITIES = [
  { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona', lat: 41.3879, lng: 2.1699 },
  { name: 'Sevilla', lat: 37.3891, lng: -5.9845 },
  { name: 'Zaragoza', lat: 41.6488, lng: -0.8891 },
  { name: 'Málaga', lat: 36.7213, lng: -4.4214 },
  { name: 'Bilbao', lat: 43.2630, lng: -2.9350 },
  { name: 'Alicante', lat: 38.3452, lng: -0.4810 },
];

export const PricesScreen: React.FC<PricesScreenProps> = ({
  stations,
  favoriteStationIds = [],
  onToggleFavorite,
  onSelectStationToRefuel,
  onShowToast,
  userLocation,
  gpsStatus,
  onRequestLocation,
  isPermissionDenied,
  isLastKnown,
  isLoadingStations = false,
  onSetManualLocation,
}) => {
  const [filter, setFilter] = useState<FilterOption>('cheapest');
  const [searchQuery, setSearchQuery] = useState('');
  const [fuelType, setFuelType] = useState('Diésel A (Kia Cerato 1.6)');
  const [isFuelSelectorOpen, setIsFuelSelectorOpen] = useState(false);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string>('station-plenoil');
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Filter and sort stations - FAVORITES FIRST!
  const safeFavIds = Array.isArray(favoriteStationIds) ? favoriteStationIds : [];

  const filteredStations = [...stations]
    .filter((st) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (st.name || '').toLowerCase().includes(q) ||
        (st.address || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aFav = safeFavIds.includes(a.id);
      const bFav = safeFavIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      if (filter === 'cheapest') return a.pricePerLiter - b.pricePerLiter;
      if (filter === 'closest') return a.distanceKm - b.distanceKm;
      if (filter === 'detour') return a.detourMinutes - b.detourMinutes;
      return 0;
    });

  const fuelOptions = [
    'Diésel A (Kia Cerato 1.6)',
    'Diésel Premium / Plus',
    'Gasolina 95 E5',
    'Gasolina 98 E5',
    'GLP Autogás',
  ];

  const handleRecenter = async () => {
    onShowToast('Obteniendo tu posición GPS...', 'info');
    const newLoc = await onRequestLocation({ userInitiated: true });
    if (newLoc) {
      onShowToast(`📍 Mapa centrado en tu ubicación: ${newLoc.address || newLoc.city}`, 'success');
    } else {
      onShowToast(`📍 Centrado en última posición conocida: ${userLocation.address || userLocation.city || 'Ubicación guardada'}`, 'info');
    }
  };

  const renderWeeklyVariation = (change: number) => {
    if (change < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[#006b27] dark:text-[#34d399] font-bold text-[11px]">
          <span className="text-[13px] leading-none">↓</span>
          <span>{change.toFixed(3).replace('.', ',')} € (7d)</span>
        </span>
      );
    } else if (change === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[#006b27] dark:text-[#34d399] font-bold text-[11px]">
          <span className="text-[13px] leading-none">=</span>
          <span>0,000 € (7d)</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-0.5 text-[#006b27] dark:text-[#34d399] font-bold text-[11px]">
          <span className="text-[13px] leading-none">↑</span>
          <span>+{change.toFixed(3).replace('.', ',')} € (7d)</span>
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-24 space-y-4 text-[#1a1b1f] dark:text-[#f2f3f8]">
      <PriceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        stations={stations}
      />

      {/* Real GPS Location Bar */}
      <div className="bg-white dark:bg-[#1c1d24] rounded-2xl p-3.5 shadow-sm border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              gpsStatus === 'success'
                ? 'bg-[#006b27]/10 dark:bg-[#006b27]/20 text-[#006b27] dark:text-[#34d399]'
                : gpsStatus === 'denied'
                ? 'bg-[#fe9400]/15 dark:bg-[#fe9400]/25 text-[#8c5000] dark:text-[#f59e0b]'
                : 'bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa]'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {gpsStatus === 'loading' ? 'sync' : gpsStatus === 'denied' ? 'location_disabled' : 'location_on'}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-bold truncate text-[#1a1b1f] dark:text-[#f2f3f8]">
                  {userLocation.address || userLocation.city || 'Ubicación actual'}
                </span>

                {gpsStatus === 'success' ? (
                  <span className="text-[10px] bg-[#006b27]/10 text-[#006b27] dark:text-[#34d399] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006b27] dark:bg-[#34d399] animate-pulse" />
                    GPS Activo
                  </span>
                ) : isLastKnown || gpsStatus === 'last_known' ? (
                  <span className="text-[10px] bg-[#0058bc]/10 text-[#0058bc] dark:text-[#60a5fa] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[10px]">history</span>
                    Última conocida
                  </span>
                ) : gpsStatus === 'denied' ? (
                  <span className="text-[10px] bg-[#fe9400]/15 text-[#8c5000] dark:text-[#f59e0b] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[10px]">warning</span>
                    Sin permiso GPS
                  </span>
                ) : (
                  <span className="text-[10px] bg-black/5 dark:bg-white/10 text-[#717786] dark:text-[#a2a7b7] px-2 py-0.5 rounded-full font-semibold shrink-0">
                    {gpsStatus === 'loading' ? 'Buscando GPS...' : 'GPS'}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7] truncate">
                {userLocation.province ? `${userLocation.city}, ${userLocation.province}` : 'Gasolineras actualizadas en tiempo real'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onRequestLocation({ userInitiated: true })}
              title="Obtener ubicación por GPS"
              className={`p-2 rounded-xl active:scale-95 transition-all flex items-center justify-center ${
                gpsStatus === 'loading'
                  ? 'bg-[#0058bc]/10 text-[#0058bc] animate-spin'
                  : 'bg-[#f4f3f8] dark:bg-[#282b35] text-[#0058bc] dark:text-[#60a5fa] hover:bg-[#e9e7ed]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {gpsStatus === 'loading' ? 'sync' : 'near_me'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCitySelectorOpen(!isCitySelectorOpen)}
              className="text-[#0058bc] dark:text-[#60a5fa] text-[12px] font-semibold px-2.5 py-2 rounded-xl bg-[#f4f3f8] dark:bg-[#282b35] hover:bg-[#eeedf3] active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Ciudad</span>
              <span className="material-symbols-outlined text-[16px]">
                {isCitySelectorOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick City Selector Dropdown */}
        {isCitySelectorOpen && (
          <div className="pt-2 mt-1 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-2 animate-in fade-in duration-150">
            <span className="text-[11px] font-semibold text-[#717786] dark:text-[#a2a7b7]">
              O selecciona una ciudad para ver sus gasolineras:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    if (onSetManualLocation) {
                      onSetManualLocation(c.lat, c.lng, c.name, `${c.name} Centro`);
                    }
                    setIsCitySelectorOpen(false);
                  }}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium transition-all ${
                    userLocation.city === c.name
                      ? 'bg-[#0058bc] text-white font-bold shadow-sm'
                      : 'bg-[#f4f3f8] dark:bg-[#282b35] text-[#1a1b1f] dark:text-[#f2f3f8] hover:bg-[#e9e7ed]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Permission Notice Banner when GPS is denied */}
        {gpsStatus === 'denied' && (
          <div className="mt-1 p-2.5 bg-[#fe9400]/10 dark:bg-[#fe9400]/15 rounded-xl border border-[#fe9400]/25 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-[#8c5000] dark:text-[#f59e0b]">
              <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
              <span>
                Para ver las gasolineras en tu posición exacta, activa el acceso a la ubicación en tu navegador.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRequestLocation({ userInitiated: true })}
              className="font-bold text-[#8c5000] dark:text-[#f59e0b] bg-[#fe9400]/20 hover:bg-[#fe9400]/30 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap"
            >
              Permitir GPS
            </button>
          </div>
        )}
      </div>

      {/* Search & Active Fuel Indicator */}
      <div className="flex flex-col gap-2.5">
        {/* Fuel Selector Pill Bar */}
        <div className="relative">
          <div className="flex items-center justify-between bg-[#f4f3f8] dark:bg-[#23252e] px-4 py-2.5 rounded-full shadow-sm border border-black/[0.03] dark:border-white/[0.05]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#fe9400] text-[20px]">
                local_gas_station
              </span>
              <span className="text-[13px] font-semibold truncate">
                {fuelType}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFuelSelectorOpen(!isFuelSelectorOpen)}
              className="flex items-center gap-0.5 text-[#0058bc] dark:text-[#60a5fa] active:opacity-70 transition-opacity shrink-0"
            >
              <span className="text-[11px] font-semibold">Cambiar</span>
              <span className="material-symbols-outlined text-[16px]">
                {isFuelSelectorOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {/* Fuel Dropdown Menu */}
          {isFuelSelectorOpen && (
            <div className="absolute top-12 left-0 right-0 z-30 bg-white dark:bg-[#23252e] rounded-2xl shadow-lg border border-black/[0.06] dark:border-white/[0.08] p-1.5 flex flex-col gap-1">
              {fuelOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setFuelType(opt);
                    setIsFuelSelectorOpen(false);
                    onShowToast(`Combustible cambiado a: ${opt}`);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-[13px] transition-colors flex items-center justify-between ${
                    fuelType === opt
                      ? 'bg-[#0058bc]/10 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] font-semibold'
                      : 'hover:bg-[#f4f3f8] dark:hover:bg-[#2c2d38] text-[#1a1b1f] dark:text-[#f2f3f8]'
                  }`}
                >
                  <span>{opt}</span>
                  {fuelType === opt && (
                    <span className="material-symbols-outlined text-[16px] text-[#0058bc] dark:text-[#60a5fa]">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-[#717786] dark:text-[#a2a7b7] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar estación, código postal o calle..."
            className="w-full h-11 pl-10 pr-10 bg-white dark:bg-[#23252e] placeholder:text-[#717786] dark:placeholder:text-[#a2a7b7] text-[14px] rounded-full shadow-sm outline-none transition-all focus:ring-1 focus:ring-[#0058bc] dark:focus:ring-[#3b82f6] border border-black/[0.04] dark:border-white/[0.06]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f] dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onShowToast('Filtros avanzados activos: Abierto 24h, Diésel A')}
              className="absolute right-3 text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f] dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          )}
        </div>

        {/* Filter bar with 6M History Button */}
        <div className="flex items-center gap-2">
          {/* iOS Native Segmented Filter */}
          <div className="grid grid-cols-3 bg-[#eeedf3] dark:bg-[#23252e] p-1 rounded-full text-center select-none flex-1">
            <button
              type="button"
              onClick={() => setFilter('cheapest')}
              className={`py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                filter === 'cheapest'
                  ? 'bg-white dark:bg-[#2e313d] text-[#1a1b1f] dark:text-white shadow-sm'
                  : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f]'
              }`}
            >
              Más barata
            </button>
            <button
              type="button"
              onClick={() => setFilter('closest')}
              className={`py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                filter === 'closest'
                  ? 'bg-white dark:bg-[#2e313d] text-[#1a1b1f] dark:text-white shadow-sm'
                  : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f]'
              }`}
            >
              Más cercana
            </button>
            <button
              type="button"
              onClick={() => setFilter('detour')}
              className={`py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                filter === 'detour'
                  ? 'bg-white dark:bg-[#2e313d] text-[#1a1b1f] dark:text-white shadow-sm'
                  : 'text-[#717786] dark:text-[#a2a7b7] hover:text-[#1a1b1f]'
              }`}
            >
              Menor desvío
            </button>
          </div>

          {/* 6-Month Evolution Button */}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 rounded-full bg-[#006b27]/10 dark:bg-[#006b27]/25 text-[#006b27] dark:text-[#34d399] border border-[#006b27]/25 text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
            title="Ver evolución de precios en los últimos 6 meses"
          >
            <span className="material-symbols-outlined text-[15px]">show_chart</span>
            <span>Histórico 6M</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Card */}
      <div
        id="gas-stations-map"
        className="relative w-full h-52 rounded-2xl overflow-hidden shadow-sm bg-[#eeedf3] dark:bg-[#181920] border border-black/[0.04] dark:border-white/[0.06]"
      >
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url('${MAP_IMAGE_URL}')` }}
        />

        {/* Translucent Apple-Maps Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf9fe]/20 dark:from-black/30 via-transparent to-[#faf9fe]/80 dark:to-[#0e0f12]/90 pointer-events-none" />

        {/* Live Radius Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-[#1f2129]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/[0.03] dark:border-white/[0.05]">
          <span className="w-2 h-2 rounded-full bg-[#006b27] animate-pulse" />
          <span className="text-[11px] text-[#1a1b1f] dark:text-[#f2f3f8] font-semibold">
            Radio 5 km • {userLocation?.city || 'Tu zona'} • {filteredStations.length} estaciones
          </span>
        </div>

        {/* Recenter Floating Button */}
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Centrar en mi posición"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-[#1f2129]/95 backdrop-blur shadow-sm flex items-center justify-center text-[#0058bc] dark:text-[#60a5fa] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">near_me</span>
        </button>

        {/* Map Price Bubbles Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* User Location Dot */}
          <div className="absolute top-[52%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
            <span className="w-7 h-7 rounded-full bg-[#0058bc]/20 animate-ping absolute" />
            <span className="w-4 h-4 rounded-full bg-[#0058bc] ring-2 ring-white shadow-md" />
          </div>

          {/* Station Markers */}
          {stations.map((station) => {
            const isSelected = selectedStationId === station.id;
            const isFav = safeFavIds.includes(station.id);
            return (
              <div
                key={station.id}
                onClick={() => {
                  setSelectedStationId(station.id);
                  const el = document.getElementById(`station-card-${station.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="absolute pointer-events-auto transform -translate-x-1/2 cursor-pointer transition-transform duration-200 active:scale-110"
                style={{
                  top: station.mapPinPos.top,
                  left: station.mapPinPos.left,
                }}
              >
                {station.isLowestPrice ? (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full shadow-md text-white ${
                      isSelected ? 'bg-[#006b27] scale-110 ring-2 ring-white' : 'bg-[#006b27]'
                    }`}
                  >
                    {isFav ? (
                      <span className="text-[11px] text-amber-300">★</span>
                    ) : (
                      <span className="material-symbols-outlined text-[13px]">
                        eco
                      </span>
                    )}
                    <span className="text-[11px] font-bold">
                      {station.pricePerLiter.toFixed(3).replace('.', ',')} €
                    </span>
                  </div>
                ) : (
                  <div
                    className={`bg-white dark:bg-[#1f2129] text-[#1a1b1f] dark:text-[#f2f3f8] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-black/[0.05] dark:border-white/[0.08] ${
                      isSelected ? 'ring-2 ring-[#0058bc] scale-110' : ''
                    }`}
                  >
                    {isFav && <span className="text-[11px] text-amber-500">★</span>}
                    <span className="text-[11px] font-bold">
                      {station.pricePerLiter.toFixed(3).replace('.', ',')} €
                    </span>
                  </div>
                )}
                <div
                  className={`w-1.5 h-1.5 mx-auto rotate-45 -mt-0.5 rounded-[1px] ${
                    station.isLowestPrice ? 'bg-[#006b27]' : 'bg-white dark:bg-[#1f2129]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Stations Feed */}
      <div className="flex flex-col gap-3">
        {filteredStations.map((station) => {
          const isSelected = selectedStationId === station.id;
          const isDetailsOpen = expandedDetailsId === station.id;
          const isFavorite = safeFavIds.includes(station.id);

          return (
            <div
              key={station.id}
              id={`station-card-${station.id}`}
              onClick={() => setSelectedStationId(station.id)}
              className={`flex flex-col bg-white dark:bg-[#1c1d24] rounded-2xl p-4 shadow-sm space-y-3 border transition-all duration-200 ${
                isSelected
                  ? 'border-[#0058bc]/40 dark:border-[#3b82f6]/50 ring-1 ring-[#0058bc]/20'
                  : 'border-black/[0.03] dark:border-white/[0.05]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Favorite toggle star */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(station.id);
                        onShowToast(
                          isFavorite
                            ? `Eliminada de favoritas: ${station.name}`
                            : `⭐ Marcada como favorita: ${station.name}`
                        );
                      }}
                      className="p-0.5 -ml-1 text-[#717786] dark:text-[#a2a7b7] hover:text-amber-500 active:scale-125 transition-transform"
                      title={isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isFavorite
                            ? 'text-amber-500 fill-current'
                            : 'text-[#c1c6d7] dark:text-[#474c5d]'
                        }`}
                        style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    </button>

                    <h2 className="text-[18px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] truncate">
                      {station.name}
                    </h2>

                    {isFavorite && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        ⭐ Favorita
                      </span>
                    )}

                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        station.badgeType === 'green'
                          ? 'bg-[#006b27]/10 text-[#006b27] dark:text-[#34d399]'
                          : station.badgeType === 'blue'
                          ? 'bg-[#0058bc]/10 text-[#0058bc] dark:text-[#60a5fa]'
                          : 'bg-[#e9e7ed] dark:bg-[#282b35] text-[#414755] dark:text-[#c1c6d7]'
                      }`}
                    >
                      {station.badge}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#717786] dark:text-[#a2a7b7] truncate mt-0.5">
                    {station.address}
                  </p>

                  <div className="flex items-center gap-2 text-[#717786] dark:text-[#a2a7b7] text-[11px] mt-1 font-medium flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        distance
                      </span>
                      <span>{station.detourText}</span>
                    </div>

                    <span className="text-black/20 dark:text-white/20">•</span>

                    {/* 7-day variation indicator */}
                    <div className="flex items-center gap-1 bg-[#f4f3f8] dark:bg-[#262832] px-2 py-0.5 rounded-full">
                      {renderWeeklyVariation(station.weeklyPriceChange)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className={`text-[26px] font-bold tracking-tight leading-none ${
                        station.isLowestPrice
                          ? 'text-[#006b27] dark:text-[#34d399]'
                          : 'text-[#1a1b1f] dark:text-[#f2f3f8]'
                      }`}
                    >
                      {station.pricePerLiter.toFixed(3).replace('.', ',')}
                    </span>
                    <span className="text-[12px] text-[#717786] dark:text-[#a2a7b7] font-semibold">
                      €/L
                    </span>
                  </div>
                  <span className="text-[10px] text-[#717786] dark:text-[#a2a7b7] mt-0.5">
                    {station.savingsVsFullTank && !station.isLowestPrice ? (
                      <span className="text-[#006b27] dark:text-[#34d399] font-semibold">
                        Ahorras ~{station.savingsVsFullTank.toFixed(2).replace('.', ',')} €
                      </span>
                    ) : (
                      station.updatedAgo
                    )}
                  </span>
                </div>
              </div>

              {/* Personalized Fuel Savings Notification Callout */}
              {station.savingsVsFullTank && station.isLowestPrice && (
                <div className="flex items-center gap-2.5 bg-[#008733]/10 dark:bg-[#008733]/20 px-3 py-2 rounded-xl text-[#006b27] dark:text-[#34d399]">
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    savings
                  </span>
                  <span className="text-[12px] font-medium leading-snug">
                    Ahorras{' '}
                    <strong className="font-bold">
                      ~{station.savingsVsFullTank.toFixed(2).replace('.', ',')} €
                    </strong>{' '}
                    llenando el depósito de tu Kia Cerato.
                  </span>
                </div>
              )}

              {/* Services details expandable row */}
              {isDetailsOpen && (
                <div className="bg-[#f4f3f8] dark:bg-[#242630] p-3 rounded-xl flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-[#414755] dark:text-[#c1c6d7]">
                    Servicios disponibles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {station.services.map((srv) => (
                      <span
                        key={srv}
                        className="bg-white dark:bg-[#181920] px-2 py-0.5 rounded-md text-[11px] text-[#1a1b1f] dark:text-[#f2f3f8] border border-black/[0.04] dark:border-white/[0.06]"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {station.isLowestPrice ? (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <a
                    href={`https://maps.apple.com/?daddr=${station.lat},${station.lng}&q=${encodeURIComponent(
                      `${station.name} ${station.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#eeedf3] dark:bg-[#282b35] hover:bg-[#e9e7ed] text-[#1a1b1f] dark:text-[#f2f3f8] py-2.5 rounded-full text-[13px] font-semibold active:scale-95 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0058bc] dark:text-[#60a5fa]">
                      directions
                    </span>
                    <span>Cómo llegar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onSelectStationToRefuel(station)}
                    className="flex items-center justify-center gap-1.5 bg-[#0058bc] hover:bg-[#004493] text-white py-2.5 rounded-full text-[13px] font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      local_gas_station
                    </span>
                    <span>Repostar aquí</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-0.5 text-[#717786] dark:text-[#a2a7b7] text-[11px]">
                  <div className="flex items-center gap-2">
                    {station.services.slice(0, 2).map((srv, idx) => (
                      <span key={srv} className="flex items-center gap-1">
                        {idx > 0 && <span>•</span>}
                        <span>{srv}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDetailsId(isDetailsOpen ? null : station.id);
                      }}
                      className="text-[#0058bc] dark:text-[#60a5fa] font-semibold flex items-center gap-0.5 active:opacity-70"
                    >
                      <span>{isDetailsOpen ? 'Ocultar' : 'Detalles'}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isDetailsOpen ? 'expand_less' : 'chevron_right'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStationToRefuel(station);
                      }}
                      className="bg-[#f4f3f8] dark:bg-[#282b35] hover:bg-[#eeedf3] text-[#0058bc] dark:text-[#60a5fa] px-2.5 py-1 rounded-full font-semibold active:scale-95 transition-all"
                    >
                      Elegir
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Sync Footer Attribution Note */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-1 text-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#006b27]" />
        <p className="text-[11px] text-[#717786]">
          Datos oficiales sincronizados hace 4 min vía MITECO (Gobierno de España)
        </p>
      </div>
    </div>
  );
};
