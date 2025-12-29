"use client";

import classNames from "classnames";
import {
  SearchBoxFeatureSuggestion,
  SearchBoxRetrieveResponse,
} from "@mapbox/search-js-core";

import dynamic from "next/dynamic";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  { ssr: false }
);

import cardStyles from "./RouteCard.module.scss";
import styles from "./CurrentLocationInput.module.scss";

const CurrentLocationInput = ({
  curPos,
  manualStart,
  onStartSelect,
}: {
  curPos: number[] | undefined;
  manualStart?: SearchBoxFeatureSuggestion;
  onStartSelect?: (res: SearchBoxRetrieveResponse) => void;
}) => {
  if (curPos) {
    return (
      <div className={cardStyles["route-slot"]}>
        <div
          className={classNames(
            cardStyles["route-card"],
            cardStyles["current-location"]
          )}
        >
          <div className={styles["location-status"]}>
            <div className={styles["geo-indicator-yes"]} />
          </div>
          <div className={cardStyles["route-item-info"]}>
            <div className={cardStyles["route-item-name"]}>
              Current Location
            </div>
            <div className={cardStyles["route-item-address"]}>
              Using device location
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to manual input if no curPos
  return (
    <div className={cardStyles["route-slot"]}>
      <div
        className={classNames(
          cardStyles["route-card"],
          cardStyles["current-location"]
        )}
      >
        <div className={styles["location-status"]}>
          {!manualStart && <div className={styles["geo-indicator-no"]} />}
        </div>
        <div className={styles["search-box-container"]}>
          <SearchBox
            accessToken={process.env.MAP_BOX_API_KEY!}
            onRetrieve={onStartSelect}
            placeholder="Enter start location"
            value={manualStart ? manualStart.properties.name : ""}
            theme={{
              variables: {
                unit: "var(--searchbox-unit)",
                padding: "var(--searchbox-padding)",
                borderRadius: "var(--searchbox-borderRadius)",
                border: "var(--searchbox-border)",
                boxShadow: "var(--searchbox-boxShadow)",
                fontFamily: "inherit",
                colorBackground: "#ffffff",
                colorText: "#111827",
                colorBackgroundHover: "#f9fafb",
              },
            }}
            popoverOptions={{
              placement: "bottom-start",
              flip: false,
              offset: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentLocationInput;
