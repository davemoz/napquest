"use client";

import styles from "./NavigationMode.module.scss";

interface Step {
  maneuver: {
    instruction: string;
    type: string;
    modifier?: string;
  };
  distance: number;
  duration: number;
  name: string;
}

interface Leg {
  steps: Step[];
  distance: number;
  duration: number;
  summary: string;
}

interface Route {
  legs: Leg[];
  duration: number;
  distance: number;
}

interface NavigationModeProps {
  route: Route;
  onExit: () => void;
}

export default function NavigationMode({ route, onExit }: NavigationModeProps) {
  // We assume the first leg for a simple A to B route
  const leg = route.legs[0];
  if (!leg || !leg.steps) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Navigation</h2>
          <button onClick={onExit} className={styles["exit-button"]}>
            Exit
          </button>
        </div>
        <div className={styles.summary}>No detailed steps available.</div>
      </div>
    );
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Driving Directions</h2>
        <button onClick={onExit} className={styles["exit-button"]}>
          Exit
        </button>
      </div>

      <div className={styles.summary}>
        <div className={styles["summary-row"]}>
          <span className={styles.label}>Total Time</span>
          <span className={styles.value}>{formatDuration(route.duration)}</span>
        </div>
        <div className={styles["summary-row"]}>
          <span className={styles.label}>Total Distance</span>
          <span className={styles.value}>{formatDistance(route.distance)}</span>
        </div>
      </div>

      <div className={styles["steps-list"]}>
        {leg.steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles["step-icon"]}>{index + 1}</div>
            <div className={styles["step-content"]}>
              <div className={styles["step-instruction"]}>
                {step.maneuver.instruction}
              </div>
              <div className={styles["step-distance"]}>
                {formatDistance(step.distance)}
              </div>
            </div>
          </div>
        ))}
        {/* Destination Flag */}
        <div className={styles.step}>
          <div
            className={styles["step-icon"]}
            style={{ background: "#dcfce7", color: "#166534" }}
          >
            🏁
          </div>
          <div className={styles["step-content"]}>
            <div className={styles["step-instruction"]}>
              Arrive at destination
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
