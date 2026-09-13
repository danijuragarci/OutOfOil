export interface RefuelRecord {
  id: string;
  date: string;
  stationName: string;
  address?: string;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  odometer: number;
  isFullTank: boolean;
  tripKm?: number;
  computedConsumption?: number; // L/100km
  computedCostPerKm?: number; // €/km
  ticketPhotoUrl?: string; // Fotografía del ticket del suministro
  ticketPhoto?: string; // Alias para compatibilidad
}

export type InsuranceFrequency = 'anual' | 'semestral' | 'cuatrimestral' | 'trimestral' | 'mensual';

export interface PlannedTrip {
  id: string;
  title: string;
  origin: string;
  destination: string;
  distanceKm: number;
  date: string;
  notes?: string;
  excludeFromMonthlyRate: boolean; // Si no distorsiona el ritmo medio de km/mes
  estimatedFuelLiters?: number;
  estimatedFuelCost?: number;
  isCompleted?: boolean;
}

export interface VehicleInfo {
  modelName: string;
  version: string;
  year: number;
  engine: string;
  tankCapacity: number; // e.g. 53L
  currentLiters: number; // e.g. 36L
  fuelPercentage: number; // e.g. 68%
  estimatedRange: number; // e.g. 640 km (calculada a partir del consumo medio de los últimos meses)
  totalOdometer: number; // e.g. 214850 km
  avgConsumption: number; // e.g. 5.4 L/100
  costPerKm: number; // e.g. 0.089 €/km
  monthlyExpense: number; // e.g. 134.60 €
  monthlyLiters: number; // e.g. 90.4 L
  lastRefuelTrip: number; // e.g. 420 km
  lastRefuelDaysAgo: number; // e.g. 4
  lastRefuelCost: number; // e.g. 67.30 €
  monthlyKmRate: number; // e.g. 1150 km/mes
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'ok' | 'pending' | 'warning';
  badgeText: string;
}

export interface WorkshopExpense {
  id: string;
  concept: string;
  workshopName: string;
  date: string;
  odometer: number;
  cost: number;
  invoicePhotoUrl?: string; // Fotografía del ticket o factura del taller
  replacementIntervalKm?: number; // Kilómetros para volver a sustituir la pieza (ej. 30.000 km)
  nextReplacementOdometer?: number; // Odómetro objetivo para el próximo cambio (ej. 241.500 km)
}

export interface MaintenanceState {
  oilCycleKm: number; // e.g. 7550
  oilIntervalKm: number; // e.g. 10000
  oilEstimatedDate: string; // e.g. "~18 de Mayo de 2025"
  oilEstimatedDays: number; // e.g. 64
  itvValidUntil: string; // e.g. "14 de Noviembre de 2025"
  itvDaysRemaining: number; // e.g. 243
  itvAlertsEnabled: boolean;
  insuranceCompany: string; // e.g. "Mapfre Terceros Ampliado + Grúa"
  insuranceRenewDate: string; // e.g. "22 Jun 2025"
  insuranceDaysRemaining: number; // e.g. 84
  insurancePremium: number; // e.g. 320.00 (prima anual total)
  insurancePaymentFrequency: InsuranceFrequency; // anual, semestral, cuatrimestral, trimestral, mensual
  insuranceInstallmentCost: number; // importe por recibo
  checklist: ChecklistItem[];
  itvChecklist?: ChecklistItem[]; // Checklist específico de comprobación pre-ITV para Kia Cerato 1.6 CRDi
  workshopExpenses: WorkshopExpense[];
}

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  province?: string;
  postcode?: string;
  timestamp: number;
  accuracy?: number;
  source: 'gps' | 'last_known' | 'manual';
}

export type GPSStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error' | 'last_known';

export interface StationPriceHistoryPoint {
  month: string;
  price: number;
}

export interface GasStation {
  id: string;
  name: string;
  badge: string;
  badgeType: 'green' | 'blue' | 'gray';
  address: string;
  distanceKm: number;
  detourMinutes: number;
  detourText: string;
  pricePerLiter: number;
  priceTagText?: string;
  updatedAgo: string;
  savingsVsFullTank?: number;
  services: string[];
  lat: number;
  lng: number;
  mapPinPos: { top: string; left: string };
  isLowestPrice?: boolean;
  weeklyPriceChange: number; // Variación con respecto a los últimos 7 días (+/- en euros)
  sixMonthsHistory: StationPriceHistoryPoint[]; // Histórico 6 meses
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type TabType = 'metricas' | 'repostar' | 'precios' | 'taller';
