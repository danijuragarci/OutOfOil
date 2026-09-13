import { VehicleInfo, RefuelRecord, MaintenanceState, GasStation, PlannedTrip } from './types';

export const BRAND_LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1Wj9iUAOCo2VfJxb1hQ8ENzIpXsCKokLHJzQozC2COm_uvlLdZR47I77L-XQki_T1q7RFvtsjcM29o_38jzk_LjtKlOdhahYGkYrJe-nLTNA9mGcRev7lHwrtg3Y8f43K5b8jOejqoxVKKV06XOyDIVnfntwMjeLamuXnFx2jER5plKeAqUFSRq_vhSnjcURrdlxS19Zv6QiDnd4mR0LnYhBnNHRjy-ov-Wp7cn3Bja4FMyMMPyF1KD25k';
export const MAP_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd_5j0Y3g00-S6EyhX09830bkQLgno6MlvD2_H846sTO0jjOP6YwktZgD0fnO-FC5QpBGIijFtKIxdS3EVsuI8HVmQhJ5fStB8DpQo-ugKuRD8BYwklrOeEuBN2kGIGBmFcItkmpxdG5E9f4om5mD7Gwz6_FOGQ_zGUE8LAca314RLrGKeGEuo64y7cF8FSfBcveWP9nUbsOp7i8YGPrwbt4j4GOCx1x6dNmRWTnMXYxOz2To4IaO8';

export const initialVehicle: VehicleInfo = {
  modelName: 'Kia Cerato 1.6 CRDi',
  version: '2006 • Diésel Turbo 115 CV',
  year: 2006,
  engine: '1.6 CRDi 115 CV Turbodiésel',
  tankCapacity: 53,
  currentLiters: 36,
  fuelPercentage: 68,
  estimatedRange: 667, // calculado dinámicamente con el consumo de los últimos meses (36 / 5.4 * 100)
  totalOdometer: 214850,
  avgConsumption: 5.4,
  costPerKm: 0.089,
  monthlyExpense: 134.60,
  monthlyLiters: 90.4,
  lastRefuelTrip: 420,
  lastRefuelDaysAgo: 4,
  lastRefuelCost: 67.30,
  monthlyKmRate: 1150
};

export const initialRefuels: RefuelRecord[] = [
  {
    id: 'refuel-1',
    date: '12 Mar',
    stationName: 'Cepsa • Sagunto',
    address: 'Autovía Sagunto km 12',
    liters: 45.10,
    pricePerLiter: 1.519,
    totalPrice: 68.51,
    odometer: 214850,
    isFullTank: true,
    tripKm: 830,
    computedConsumption: 5.40,
    computedCostPerKm: 0.082
  },
  {
    id: 'refuel-2',
    date: '28 Feb',
    stationName: 'BP • Valencia Norte',
    address: 'Ronda Norte 88',
    liters: 40.00,
    pricePerLiter: 1.549,
    totalPrice: 61.96,
    odometer: 214020,
    isFullTank: true,
    tripKm: 760,
    computedConsumption: 5.25,
    computedCostPerKm: 0.081
  },
  {
    id: 'refuel-3',
    date: '15 Feb',
    stationName: 'Repsol • A-7 km 14',
    address: 'Autovía del Mediterráneo',
    liters: 46.20,
    pricePerLiter: 1.489,
    totalPrice: 68.79,
    odometer: 213260,
    isFullTank: true,
    tripKm: 780,
    computedConsumption: 5.92,
    computedCostPerKm: 0.088
  }
];

export const initialPlannedTrips: PlannedTrip[] = [
  {
    id: 'trip-1',
    title: 'Viaje a Madrid (Reunión y retorno)',
    origin: 'Valencia',
    destination: 'Madrid',
    distanceKm: 710,
    date: '28 Mar 2025',
    notes: 'Trayecto largo por A-3. No computar para no inflar la media mensual habitual de 1.150 km/mes.',
    excludeFromMonthlyRate: true,
    estimatedFuelLiters: 38.3,
    estimatedFuelCost: 55.20,
    isCompleted: false
  },
  {
    id: 'trip-2',
    title: 'Escapada Costa Blanca',
    origin: 'Valencia',
    destination: 'Jávea / Denia',
    distanceKm: 240,
    date: '12 Abr 2025',
    notes: 'Ruta costera de fin de semana.',
    excludeFromMonthlyRate: true,
    estimatedFuelLiters: 12.9,
    estimatedFuelCost: 18.60,
    isCompleted: false
  }
];

export const consumptionTrendData = [
  { label: '02 Feb', consumption: 5.8, price: 1.44 },
  { label: '16 Feb', consumption: 5.6, price: 1.48 },
  { label: '01 Mar', consumption: 5.9, price: 1.46 },
  { label: '15 Mar', consumption: 5.3, price: 1.49 },
  { label: '29 Mar', consumption: 5.7, price: 1.51 },
  { label: '12 Abr', consumption: 5.4, price: 1.49, active: true }
];

export const defaultItvChecklist = [
  {
    id: 'itv-1',
    title: 'Opacidad de humos diésel (k < 1.5 m⁻¹)',
    description: 'Prueba al corte de inyección. Descarbonizar en autovía a 3.000 rpm en 3ª/4ª antes de entrar.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-2',
    title: 'Frenómetro y desequilibrio entre ejes',
    description: 'Eficacia de discos/pastillas. Cable del freno de mano tensado a 5-6 clics de palanca.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-3',
    title: 'Holguras en foso: silentblocks y rótulas',
    description: 'Placas de holgura: silentblocks de trapecios, bieletas estabilizadoras y fuelles de palier.',
    status: 'pending' as const,
    badgeText: 'Revisar'
  },
  {
    id: 'itv-4',
    title: 'Fugas de fluidos bajo motor 1.6 CRDi',
    description: 'Inspección de cárter, retén y racores del turbo/intercooler sin goteo activo al foso.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-5',
    title: 'Alumbrado y reglaje de faros halógenos',
    description: 'Cruce, carretera, regulación de altura, intermitentes, marcha atrás, antiniebla y matrícula.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-6',
    title: 'Neumáticos, medidas y código de carga',
    description: 'Medida 195/65 R15 91V (o 205/55 R16), profundidad > 1,6 mm y desgaste simétrico sin cortes.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-7',
    title: 'Testigo OBD y cuadro (MIL Check Engine / Airbag)',
    description: 'Deben encenderse al contacto y apagarse al arrancar. Sin fallos DTC registrados en ECU.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-8',
    title: 'Limpiaparabrisas, eyectores y claxon',
    description: 'Escobillas limpias, depósito con agua jabonosa y chorros con presión. Bocina sonora.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  },
  {
    id: 'itv-9',
    title: 'Cinturones de seguridad, anclajes y lunas',
    description: 'Retención por inercia en 5 plazas, anclajes accesibles y parabrisas sin picaduras en visión.',
    status: 'ok' as const,
    badgeText: 'Favorable'
  }
];

export const initialMaintenance: MaintenanceState = {
  oilCycleKm: 7550,
  oilIntervalKm: 10000,
  oilEstimatedDate: '~18 de Mayo de 2025',
  oilEstimatedDays: 64,
  itvValidUntil: '14 de Noviembre de 2025',
  itvDaysRemaining: 243,
  itvAlertsEnabled: true,
  insuranceCompany: 'Mapfre Terceros Ampliado + Grúa',
  insuranceRenewDate: '22 Jun 2025',
  insuranceDaysRemaining: 84,
  insurancePremium: 320.00,
  insurancePaymentFrequency: 'anual',
  insuranceInstallmentCost: 320.00,
  checklist: [
    {
      id: 'check-1',
      title: 'Pastillas de freno delanteras',
      description: 'Revisadas a los 200.000 km • Desgaste ~30%',
      status: 'ok',
      badgeText: 'OK'
    },
    {
      id: 'check-2',
      title: 'Cadena de distribución y tensor',
      description: 'Holgura y acústica verificadas sin desajuste',
      status: 'ok',
      badgeText: 'OK'
    },
    {
      id: 'check-3',
      title: 'Filtro de gasoil / combustible',
      description: 'Sustitución aconsejada a los 217.300 km',
      status: 'pending',
      badgeText: 'Próximo'
    }
  ],
  itvChecklist: defaultItvChecklist,
  workshopExpenses: [
    {
      id: 'ws-1',
      concept: 'Filtro de gasoil y filtro de aire',
      workshopName: 'Talleres Mecanicar',
      date: '10 Ene 2025',
      odometer: 211500,
      cost: 75.00,
      replacementIntervalKm: 30000,
      nextReplacementOdometer: 241500
    },
    {
      id: 'ws-2',
      concept: 'Neumáticos delanteros Michelin Primacy 4',
      workshopName: 'Norauto Alfafar',
      date: '14 Nov 2024',
      odometer: 209800,
      cost: 165.00,
      replacementIntervalKm: 45000,
      nextReplacementOdometer: 254800
    }
  ]
};

export const initialGasStations: GasStation[] = [
  {
    id: 'station-plenoil',
    name: 'Plenoil',
    badge: 'Tarifa Low-Cost 24h',
    badgeType: 'green',
    address: 'C/ Severo Ochoa, 14',
    distanceKm: 1.8,
    detourMinutes: 4,
    detourText: 'A 1,8 km • ~4 min de desvío',
    pricePerLiter: 1.419,
    updatedAgo: 'Hace 4 min',
    savingsVsFullTank: 3.80,
    services: ['24 Horas', 'Pago contactless', 'Factura digital'],
    lat: 39.475,
    lng: -0.385,
    mapPinPos: { top: '28%', left: '28%' },
    isLowestPrice: true,
    weeklyPriceChange: -0.025, // Bajó 0,025 € vs hace 7 días
    sixMonthsHistory: [
      { month: 'Oct', price: 1.469 },
      { month: 'Nov', price: 1.455 },
      { month: 'Dic', price: 1.439 },
      { month: 'Ene', price: 1.429 },
      { month: 'Feb', price: 1.444 },
      { month: 'Mar', price: 1.419 }
    ]
  },
  {
    id: 'station-ballenoil',
    name: 'Ballenoil',
    badge: 'Auto 24h',
    badgeType: 'gray',
    address: 'Polígono Industrial Norte',
    distanceKm: 2.4,
    detourMinutes: 6,
    detourText: 'A 2,4 km • ~6 min de desvío',
    pricePerLiter: 1.425,
    updatedAgo: 'Hace 12 min',
    savingsVsFullTank: 3.45,
    services: ['Pago móvil', 'Lavado a presión', 'Aspiradores'],
    lat: 39.488,
    lng: -0.362,
    mapPinPos: { top: '36%', left: '72%' },
    weeklyPriceChange: 0.000, // Mismo precio en últimos 7 días
    sixMonthsHistory: [
      { month: 'Oct', price: 1.475 },
      { month: 'Nov', price: 1.459 },
      { month: 'Dic', price: 1.442 },
      { month: 'Ene', price: 1.435 },
      { month: 'Feb', price: 1.425 },
      { month: 'Mar', price: 1.425 }
    ]
  },
  {
    id: 'station-cepsa',
    name: 'Cepsa',
    badge: 'Más cercana',
    badgeType: 'blue',
    address: 'Avenida Ronda Norte, 42',
    distanceKm: 0.9,
    detourMinutes: 2,
    detourText: 'A 0,9 km • Solo 2 min',
    pricePerLiter: 1.479,
    priceTagText: '+0,060 €/L vs Plenoil',
    updatedAgo: 'Hace 8 min',
    services: ['Carrefour Express', 'Manómetro aire', 'Cafetería'],
    lat: 39.462,
    lng: -0.395,
    mapPinPos: { top: '68%', left: '24%' },
    weeklyPriceChange: 0.030, // Subió 0,030 € vs hace 7 días
    sixMonthsHistory: [
      { month: 'Oct', price: 1.529 },
      { month: 'Nov', price: 1.509 },
      { month: 'Dic', price: 1.485 },
      { month: 'Ene', price: 1.465 },
      { month: 'Feb', price: 1.449 },
      { month: 'Mar', price: 1.479 }
    ]
  },
  {
    id: 'station-repsol',
    name: 'Repsol',
    badge: 'Estación de Servicio',
    badgeType: 'gray',
    address: 'Autovía V-30, km 4,2',
    distanceKm: 3.1,
    detourMinutes: 0,
    detourText: 'A 3,1 km • En ruta directa',
    pricePerLiter: 1.519,
    priceTagText: 'Diesel e+',
    updatedAgo: 'Hace 15 min',
    services: ['Túnel lavado', 'GLP Auto', 'Tienda Repsol On'],
    lat: 39.451,
    lng: -0.370,
    mapPinPos: { top: '64%', left: '68%' },
    weeklyPriceChange: 0.015, // Subió 0,015 € vs hace 7 días
    sixMonthsHistory: [
      { month: 'Oct', price: 1.569 },
      { month: 'Nov', price: 1.545 },
      { month: 'Dic', price: 1.529 },
      { month: 'Ene', price: 1.505 },
      { month: 'Feb', price: 1.504 },
      { month: 'Mar', price: 1.519 }
    ]
  }
];

export const initialTrips: PlannedTrip[] = [
  {
    id: 'trip-1',
    title: 'Viaje a Madrid (Trabajo)',
    origin: 'Valencia',
    destination: 'Madrid',
    distanceKm: 710,
    date: '18 Abr 2025',
    notes: 'Ida y vuelta por A-3 sin desvíos',
    excludeFromMonthlyRate: true,
    estimatedFuelLiters: 38.3,
    estimatedFuelCost: 55.15,
    isCompleted: false,
  },
  {
    id: 'trip-2',
    title: 'Escapada a Pirineos',
    origin: 'Valencia',
    destination: 'Aínsa / Ordesa',
    distanceKm: 1040,
    date: 'Mayo 2025',
    notes: 'Carretera de montaña y autovía',
    excludeFromMonthlyRate: true,
    estimatedFuelLiters: 56.2,
    estimatedFuelCost: 80.93,
    isCompleted: false,
  },
];

