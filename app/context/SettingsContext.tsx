"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type UnitSystem = "metric" | "imperial";

interface SettingsContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (unit: UnitSystem) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("napquest_units");
    if (saved === "metric" || saved === "imperial") {
      setUnitSystem(saved);
    }
  }, []);

  const handleSetUnitSystem = (unit: UnitSystem) => {
    setUnitSystem(unit);
    localStorage.setItem("napquest_units", unit);
  };

  return (
    <SettingsContext.Provider
      value={{
        unitSystem,
        setUnitSystem: handleSetUnitSystem,
        showSettings,
        setShowSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
