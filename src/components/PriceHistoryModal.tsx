import React, { useState } from 'react';
import { GasStation } from '../types';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: GasStation[];
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  stations,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('all');

  if (!isOpen) return null;

  const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];

  // Calculate monthly average or specific station series
  const activeStation = stations.find((s) => s.id === selectedStationId);

  // Compute points for SVG Chart
  // Min price ~ 1.40, Max price ~ 1.60
  const minPrice = 1.40;
  const maxPrice = 1.60;
  const chartHeight = 120;
  const chartWidth = 300;

  const getY = (val: number) => {
    const ratio = (val - minPrice) / (maxPrice - minPrice);
    return Math.max(10, Math.min(chartHeight - 10, chartHeight - ratio * (chartHeight - 20)));
  };

  const getPoints = (history: { month: string; price: number }[]) => {
    const step = chartWidth / (history.length - 1);
    return history.map((pt, i) => ({
      x: i * step,
      y: getY(pt.price),
      val: pt.price.toFixed(3),
      month: pt.month,
    }));
  };

  // Station colors
  const stationColors: Record<string, string> = {
    'station-plenoil': '#006b27', // Green
    'station-ballenoil': '#0058bc', // Blue
    'station-cepsa': '#ba1a1a', // Red/Orange
    'station-repsol': '#fe9400', // Amber
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1c1d24] text-[#1a1b1f] dark:text-[#f2f3f8] rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 border border-black/[0.04] dark:border-white/[0.08] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#0058bc]/15 dark:bg-[#3b82f6]/20 text-[#0058bc] dark:text-[#60a5fa] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">show_chart</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold leading-tight">Evolución de Precios</h3>
              <p className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">Últimos 6 meses (Oct 2024 - Mar 2025)</p>
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

        {/* Station Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedStationId('all')}
            className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
              selectedStationId === 'all'
                ? 'bg-[#0058bc] text-white shadow-xs'
                : 'bg-[#eeedf3] dark:bg-[#2b2e39] text-[#717786] dark:text-[#a2a7b7]'
            }`}
          >
            Todas comparadas
          </button>
          {stations.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStationId(st.id)}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 flex items-center gap-1 ${
                selectedStationId === st.id
                  ? 'bg-[#0058bc] text-white shadow-xs'
                  : 'bg-[#eeedf3] dark:bg-[#2b2e39] text-[#717786] dark:text-[#a2a7b7]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stationColors[st.id] || '#717786' }}
              />
              {st.name}
            </button>
          ))}
        </div>

        {/* SVG Multi-Line Trend Chart */}
        <div className="bg-[#f4f3f8] dark:bg-[#23252e] rounded-2xl p-4 border border-black/[0.03] dark:border-white/[0.04]">
          <div className="flex items-center justify-between text-[11px] text-[#717786] dark:text-[#a2a7b7] mb-2">
            <span>Máx: 1,60 €/L</span>
            <span>Mín: 1,40 €/L</span>
          </div>

          <div className="w-full flex justify-center py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36 overflow-visible">
              {/* Horizontal Reference Grid Lines */}
              <line x1="0" y1={getY(1.45)} x2={chartWidth} y2={getY(1.45)} stroke="currentColor" strokeDasharray="3,3" opacity="0.15" />
              <line x1="0" y1={getY(1.50)} x2={chartWidth} y2={getY(1.50)} stroke="currentColor" strokeDasharray="3,3" opacity="0.15" />
              <line x1="0" y1={getY(1.55)} x2={chartWidth} y2={getY(1.55)} stroke="currentColor" strokeDasharray="3,3" opacity="0.15" />

              {/* Station Curves */}
              {stations
                .filter((s) => selectedStationId === 'all' || s.id === selectedStationId)
                .map((station) => {
                  const pts = getPoints(station.sixMonthsHistory);
                  const pathData = pts.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`),
                    ''
                  );
                  const color = stationColors[station.id] || '#0058bc';

                  return (
                    <g key={station.id}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth={selectedStationId === station.id ? '3.5' : '2.5'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {pts.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={selectedStationId === station.id ? '4' : '3'}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Month labels under chart */}
          <div className="flex justify-between text-[11px] text-[#717786] dark:text-[#a2a7b7] pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            {months.map((m) => (
              <span key={m} className="w-8 text-center font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Breakdown Table by Station */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-[#717786] dark:text-[#a2a7b7] uppercase tracking-wider">
            Detalle por Gasolinera
          </span>

          <div className="space-y-2">
            {stations.map((st) => {
              const hist = st.sixMonthsHistory;
              const octPrice = hist[0].price;
              const marPrice = hist[hist.length - 1].price;
              const diff6m = Number((marPrice - octPrice).toFixed(3));
              const isLower = diff6m < 0;

              return (
                <div
                  key={st.id}
                  className="p-3 bg-[#f4f3f8] dark:bg-[#23252e] rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stationColors[st.id] || '#717786' }}
                    />
                    <div>
                      <span className="text-[13px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] block">
                        {st.name}
                      </span>
                      <span className="text-[11px] text-[#717786] dark:text-[#a2a7b7]">
                        Oct: {octPrice.toFixed(3)} € ➔ Actual: {marPrice.toFixed(3)} €
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[13px] font-bold text-[#1a1b1f] dark:text-[#f2f3f8] block">
                      {marPrice.toFixed(3)} €/L
                    </span>
                    <span
                      className={`text-[11px] font-semibold inline-flex items-center ${
                        isLower ? 'text-[#006b27] dark:text-[#34d399]' : 'text-[#ba1a1a] dark:text-[#f87171]'
                      }`}
                    >
                      {isLower ? '↓ ' : '↑ '}
                      {diff6m > 0 ? `+${diff6m.toFixed(3)}` : diff6m.toFixed(3)} € (6m)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-full bg-[#eeedf3] dark:bg-[#2b2e39] text-[#1a1b1f] dark:text-[#f2f3f8] text-[14px] font-semibold mt-1"
        >
          Cerrar Histórico
        </button>
      </div>
    </div>
  );
};
