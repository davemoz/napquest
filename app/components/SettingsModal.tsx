"use client";

import { useSettings } from "../context/SettingsContext";
import styles from "./SettingsModal.module.scss";
import { useEffect } from "react";

export default function SettingsModal() {
  const { showSettings, setShowSettings, unitSystem, setUnitSystem } =
    useSettings();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSettings(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setShowSettings]);

  if (!showSettings) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowSettings(false);
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button
            className={styles["close-button"]}
            onClick={() => setShowSettings(false)}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className={styles.section}>
          <span className={styles["section-label"]}>Distance Units</span>
          <div className={styles["options-row"]}>
            <button
              className={`${styles["option-button"]} ${
                unitSystem === "metric" ? styles.active : ""
              }`}
              onClick={() => setUnitSystem("metric")}
            >
              Metric (km)
            </button>
            <button
              className={`${styles["option-button"]} ${
                unitSystem === "imperial" ? styles.active : ""
              }`}
              onClick={() => setUnitSystem("imperial")}
            >
              Imperial (mi)
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles["section-label"]}>About</span>
          <div className={styles.about}>
            <p className={styles["about-text"]}>
              <strong>NapQuest</strong> helps you find the perfect driving route
              to match your child&apos;s nap schedule.
            </p>
            <p className={styles["about-text"]}>
              Select your destination and desired duration, and we&apos;ll find
              the best way to keep moving until nap time is over.
            </p>
            <p className={styles["disclaimer-text"]}>
              Please use at your own risk. Directions may be incorrect or
              incomplete, and are in no way the optimal route to your
              destination. This is for a nap, after all.
            </p>
            <p className={styles["disclaimer-text"]}>
              NapQuest is an independent application and is not affiliated with,
              endorsed by, or connected to MapQuest, Google Maps, or their
              respective affiliates. All trademarks are the property of their
              respective owners.
            </p>
            <div className={styles.version}>Version 1.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
