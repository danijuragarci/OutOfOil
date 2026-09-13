import React, { useState, useEffect } from 'react';
import {
  TabType,
  VehicleInfo,
  RefuelRecord,
  MaintenanceState,
  GasStation,
  WorkshopExpense,
  ThemeMode,
  PlannedTrip,
  InsuranceFrequency,
} from './types';
import {
  initialVehicle,
  initialRefuels,
  initialMaintenance,
  initialGasStations,
  initialTrips,
} from './initialData';
import { useGeolocation } from './hooks/useGeolocation';
import { getStationsForLocation } from './services/locationService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './components/DashboardScreen';
import { RefuelScreen } from './components/RefuelScreen';
import { PricesScreen } from './components/PricesScreen';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { AccountModal } from './components/AccountModal';
import { WorkshopModal } from './components/WorkshopModal';
import { InsuranceModal } from './components/InsuranceModal';
import { TripsModal } from './components/TripsModal';
import { Toast } from './components/Toast';

export default function App() {
  // Local state with localStorage hydration
  const [currentTab, setCurrentTab] = useState<TabType>('metricas');

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('ooo_theme');
      return (saved as ThemeMode) || 'system';
    } catch {
      return 'system';
    }
  });

  const [vehicle, setVehicle] = useState<VehicleInfo>(() => {
    try {
      const saved = localStorage.getItem('ooo_vehicle');
      return saved ? JSON.parse(saved) : initialVehicle;
    } catch {
      return initialVehicle;
    }
  });

  const [refuels, setRefuels] = useState<RefuelRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ooo_refuels');
      return saved ? JSON.parse(saved) : initialRefuels;
    } catch {
      return initialRefuels;
    }
  });

  const [maintenance, setMaintenance] = useState<MaintenanceState>(() => {
    try {
      const saved = localStorage.getItem('ooo_maintenance');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.itvChecklist || parsed.itvChecklist.length === 0) {
          parsed.itvChecklist = initialMaintenance.itvChecklist;
        }
        return parsed;
      }
      return initialMaintenance;
    } catch {
      return initialMaintenance;
    }
  });

  const [trips, setTrips] = useState<PlannedTrip[]>(() => {
    try {
      const saved = localStorage.getItem('ooo_trips');
      return saved ? JSON.parse(saved) : initialTrips;
    } catch {
      return initialTrips;
    }
  });

  const [favoriteStationIds, setFavoriteStationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ooo_favorite_stations');
      return saved ? JSON.parse(saved) : ['station-plenoil'];
    } catch {
      return ['station-plenoil'];
    }
  });

  // Floating Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Geolocation and GPS state management (defaults immediately to last known location)
  const {
    location: userLocation,
    status: gpsStatus,
    errorMessage: gpsErrorMessage,
    requestCurrentLocation,
    setManualLocation,
    isPermissionDenied,
    isLastKnown,
  } = useGeolocation(showToast);

  const [gasStations, setGasStations] = useState<GasStation[]>(initialGasStations);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);
  const [preselectedStation, setPreselectedStation] = useState<GasStation | null>(null);

  // Synchronize stations when userLocation updates (from live GPS, last known location, or city selection)
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingStations(true);

    getStationsForLocation(
      userLocation.lat,
      userLocation.lng,
      userLocation.postcode,
      userLocation.city
    )
      .then((stations) => {
        if (!isCancelled && stations && stations.length > 0) {
          setGasStations(stations);
        }
      })
      .catch((err) => {
        console.warn('Error fetching stations for location:', err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingStations(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [userLocation.lat, userLocation.lng, userLocation.postcode, userLocation.city]);

  // Sync theme mode to DOM root element
  useEffect(() => {
    try {
      localStorage.setItem('ooo_theme', theme);
    } catch (e) {
      console.error(e);
    }

    const applyTheme = () => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ooo_vehicle', JSON.stringify(vehicle));
    } catch (e) {
      console.error(e);
    }
  }, [vehicle]);

  useEffect(() => {
    try {
      localStorage.setItem('ooo_refuels', JSON.stringify(refuels));
    } catch (e) {
      console.error(e);
    }
  }, [refuels]);

  useEffect(() => {
    try {
      localStorage.setItem('ooo_maintenance', JSON.stringify(maintenance));
    } catch (e) {
      console.error(e);
    }
  }, [maintenance]);

  useEffect(() => {
    try {
      localStorage.setItem('ooo_trips', JSON.stringify(trips));
    } catch (e) {
      console.error(e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem('ooo_favorite_stations', JSON.stringify(favoriteStationIds));
    } catch (e) {
      console.error(e);
    }
  }, [favoriteStationIds]);

  const handleToggleFavoriteStation = (stationId: string) => {
    setFavoriteStationIds((prev) => {
      const isFav = prev.includes(stationId);
      if (isFav) {
        showToast('Gasolinera eliminada de favoritas', 'info');
        return prev.filter((id) => id !== stationId);
      } else {
        showToast('Gasolinera añadida a favoritas ⭐', 'success');
        return [...prev, stationId];
      }
    });
  };

  // Handle adding new refuel
  const handleAddRefuel = (newRefuel: RefuelRecord) => {
    setRefuels((prev) => [newRefuel, ...prev]);

    // Update vehicle stats
    setVehicle((prev) => {
      const newOdometer = Math.max(prev.totalOdometer, newRefuel.odometer);
      const newLiters = Math.min(prev.tankCapacity, Number((prev.currentLiters + newRefuel.liters).toFixed(1)));
      const fuelPercentage = Math.round((newLiters / prev.tankCapacity) * 100);
      const estimatedRange = Math.round((newLiters / (newRefuel.computedConsumption || prev.avgConsumption)) * 100);

      return {
        ...prev,
        totalOdometer: newOdometer,
        currentLiters: newRefuel.isFullTank ? 53 : newLiters,
        fuelPercentage: newRefuel.isFullTank ? 100 : fuelPercentage,
        estimatedRange: newRefuel.isFullTank ? 880 : estimatedRange,
        lastRefuelTrip: newRefuel.tripKm || 420,
        lastRefuelDaysAgo: 0,
        lastRefuelCost: newRefuel.totalPrice,
        monthlyExpense: Number((prev.monthlyExpense + newRefuel.totalPrice).toFixed(2)),
        monthlyLiters: Number((prev.monthlyLiters + newRefuel.liters).toFixed(1)),
      };
    });

    // Update maintenance cycle
    setMaintenance((prev) => ({
      ...prev,
      oilCycleKm: prev.oilCycleKm + (newRefuel.tripKm || 420),
    }));

    showToast('¡Repostaje guardado con éxito! Telemetría actualizada.', 'success');
  };

  // Handle station selection from Precios tab
  const handleSelectStationToRefuel = (station: GasStation) => {
    setPreselectedStation(station);
    setCurrentTab('repostar');
    showToast(`Gasolinera preseleccionada: ${station.name}`);
  };

  // Reset oil cycle
  const handleResetOilCycle = () => {
    setMaintenance((prev) => ({
      ...prev,
      oilCycleKm: 0,
    }));
  };

  // Toggle ITV alerts
  const handleToggleItvAlerts = () => {
    setMaintenance((prev) => {
      const nextVal = !prev.itvAlertsEnabled;
      showToast(
        nextVal
          ? 'Alertas push de ITV activadas'
          : 'Alertas push de ITV desactivadas',
        'info'
      );
      return {
        ...prev,
        itvAlertsEnabled: nextVal,
      };
    });
  };

  // Toggle checklist item (preventive or ITV)
  const handleToggleChecklistItem = (id: string, isItv?: boolean) => {
    setMaintenance((prev) => {
      if (isItv) {
        const currentItv = prev.itvChecklist && prev.itvChecklist.length > 0 ? prev.itvChecklist : (initialMaintenance.itvChecklist || []);
        return {
          ...prev,
          itvChecklist: currentItv.map((item) => {
            if (item.id === id) {
              const nextStatus = item.status === 'ok' ? 'pending' : 'ok';
              return {
                ...item,
                status: nextStatus,
                badgeText: nextStatus === 'ok' ? 'Favorable' : 'Revisar',
              };
            }
            return item;
          }),
        };
      }

      return {
        ...prev,
        checklist: prev.checklist.map((item) => {
          if (item.id === id) {
            const nextStatus = item.status === 'ok' ? 'pending' : 'ok';
            return {
              ...item,
              status: nextStatus,
              badgeText: nextStatus === 'ok' ? 'OK' : 'Pendiente',
            };
          }
          return item;
        }),
      };
    });
    showToast('Estado de la comprobación actualizado');
  };

  // Bulk set all ITV checklist items
  const handleSetAllItvChecklist = (allOk: boolean) => {
    setMaintenance((prev) => {
      const currentItv = prev.itvChecklist && prev.itvChecklist.length > 0 ? prev.itvChecklist : (initialMaintenance.itvChecklist || []);
      return {
        ...prev,
        itvChecklist: currentItv.map((item) => ({
          ...item,
          status: allOk ? 'ok' : 'pending',
          badgeText: allOk ? 'Favorable' : 'Revisar',
        })),
      };
    });
    showToast(allOk ? 'Todos los puntos marcados como favorables para ITV' : 'Comprobación de ITV reiniciada');
  };

  // Add workshop expense
  const handleAddWorkshopExpense = (expense: WorkshopExpense) => {
    setMaintenance((prev) => ({
      ...prev,
      workshopExpenses: [expense, ...prev.workshopExpenses],
    }));
    showToast(`Factura añadida: ${expense.concept} (${expense.cost.toFixed(2)} €)`);
  };

  // Update insurance policy and payment frequency
  const handleUpdateInsurance = (updated: {
    insuranceCompany: string;
    insurancePaymentFrequency: InsuranceFrequency;
    insuranceInstallmentCost: number;
    insurancePremium: number;
    insuranceRenewDate: string;
  }) => {
    setMaintenance((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Planned Trips Handlers
  const handleAddTrip = (trip: PlannedTrip) => {
    setTrips((prev) => [trip, ...prev]);
  };

  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    showToast('Viaje eliminado', 'info');
  };

  const handleToggleCompleteTrip = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = !t.isCompleted;
          if (isNowCompleted) {
            showToast(`¡Viaje "${t.title}" completado!`, 'success');
          }
          return { ...t, isCompleted: isNowCompleted };
        }
        return t;
      })
    );
  };

  // Restore backup
  const handleRestoreBackup = (data: {
    vehicle?: VehicleInfo;
    refuels?: RefuelRecord[];
    maintenance?: MaintenanceState;
  }) => {
    if (data.vehicle) setVehicle(data.vehicle);
    if (data.refuels) setRefuels(data.refuels);
    if (data.maintenance) setMaintenance(data.maintenance);
  };

  return (
    <div className="min-h-screen bg-[#faf9fe] dark:bg-[#121318] text-[#1a1b1f] dark:text-[#f2f3f8] flex flex-col font-['Inter',sans-serif] select-none transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        vehicleName="Kia Cerato 1.6 CRDi"
        onOpenProfile={() => setIsAccountModalOpen(true)}
      />

      {/* Main Content Area based on active tab */}
      <main className="flex-1 w-full flex flex-col">
        {currentTab === 'metricas' && (
          <DashboardScreen
            vehicle={vehicle}
            refuels={refuels}
            maintenance={maintenance}
            trips={trips}
            onOpenTripsModal={() => setIsTripsModalOpen(true)}
            onToggleCompleteTrip={handleToggleCompleteTrip}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'repostar' && (
          <RefuelScreen
            vehicle={vehicle}
            refuels={refuels}
            onAddRefuel={handleAddRefuel}
            preselectedStation={preselectedStation}
            onClearPreselectedStation={() => setPreselectedStation(null)}
            userLocation={userLocation}
            gpsStatus={gpsStatus}
            onRequestLocation={requestCurrentLocation}
            isLastKnown={isLastKnown}
            nearbyStations={gasStations}
          />
        )}

        {currentTab === 'precios' && (
          <PricesScreen
            stations={gasStations}
            favoriteStationIds={favoriteStationIds}
            onToggleFavorite={handleToggleFavoriteStation}
            onSelectStationToRefuel={handleSelectStationToRefuel}
            onShowToast={(msg, type) => showToast(msg, type || 'info')}
            userLocation={userLocation}
            gpsStatus={gpsStatus}
            onRequestLocation={requestCurrentLocation}
            isPermissionDenied={isPermissionDenied}
            isLastKnown={isLastKnown}
            isLoadingStations={isLoadingStations}
            onSetManualLocation={setManualLocation}
          />
        )}

        {currentTab === 'taller' && (
          <MaintenanceScreen
            vehicle={vehicle}
            maintenance={maintenance}
            onResetOilCycle={handleResetOilCycle}
            onToggleItvAlerts={handleToggleItvAlerts}
            onOpenWorkshopModal={() => setIsWorkshopModalOpen(true)}
            onOpenInsuranceModal={() => setIsInsuranceModalOpen(true)}
            onToggleChecklistItem={handleToggleChecklistItem}
            onSetAllItvChecklist={handleSetAllItvChecklist}
            onShowToast={(msg) => showToast(msg, 'success')}
          />
        )}
      </main>

      {/* iOS Bottom Sheet Modal: Perfil Y Vehículo / Cuenta y Copias */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        vehicle={vehicle}
        refuels={refuels}
        maintenance={maintenance}
        theme={theme}
        onSelectTheme={(mode) => setTheme(mode)}
        onRestoreBackup={handleRestoreBackup}
        onShowToast={(msg) => showToast(msg, 'info')}
      />

      {/* Workshop Expense Modal */}
      <WorkshopModal
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        currentOdometer={vehicle.totalOdometer}
        onAddExpense={handleAddWorkshopExpense}
      />

      {/* Insurance Policy & Payment Frequency Modal */}
      <InsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        maintenance={maintenance}
        onUpdateInsurance={handleUpdateInsurance}
        onShowToast={(msg) => showToast(msg, 'success')}
      />

      {/* Planned Trips Modal */}
      <TripsModal
        isOpen={isTripsModalOpen}
        onClose={() => setIsTripsModalOpen(false)}
        trips={trips}
        vehicle={vehicle}
        onAddTrip={handleAddTrip}
        onDeleteTrip={handleDeleteTrip}
        onToggleCompleteTrip={handleToggleCompleteTrip}
        onShowToast={(msg) => showToast(msg, 'info')}
      />

      {/* Floating Feedback Toast */}
      <Toast message={toast?.message ?? null} type={toast?.type} />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav activeTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
    </div>
  );
}

