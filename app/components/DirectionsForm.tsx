"use client";

import { useEffect, useState, useMemo } from "react";
import { Spinner } from "@chakra-ui/react";
import DragAndDropRoutes from "./DragAndDropRoutes";

import getMapboxDirections from "@/lib/getMapboxDirections";
import useRouteLayer from "@/lib/useRouteLayer";
import useFitBounds from "@/lib/useFitBounds";
import {
  SearchBoxFeatureSuggestion,
  SearchBoxRetrieveResponse,
} from "@mapbox/search-js-core";
import { Marker } from "mapbox-gl";

import dynamic from "next/dynamic";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  { ssr: false }
);

import styles from "./DirectionsForm.module.scss";
import findBestRoute from "@/lib/findBestRoute";

export default function DirectionsForm({
  map,
  curPos,
}: {
  map: any;
  curPos?: number[];
}) {
  const [manualStart, setManualStart] = useState<
    SearchBoxFeatureSuggestion | undefined
  >();
  const [route, setRoute] = useState<SearchBoxFeatureSuggestion[]>([]);
  const [targetDuration, setTargetDuration] = useState<number>(30);

  const routeCoords = useMemo(() => {
    const startCoords = manualStart?.geometry.coordinates || curPos;
    if (!startCoords) return [];

    const validStart = startCoords as number[];

    const destCoords = route.map((item) => item.geometry.coordinates);
    return [validStart, ...destCoords];
  }, [manualStart, curPos, route]);

  const [allDirections, setAllDirections] = useState<any>();
  const [routeData, setRouteData] = useState<any>();

  // Fetch all directions (with alternatives) when coordinates change
  useEffect(() => {
    if (routeCoords.length < 2) return;
    const doFetch = async () => {
      const directionsResponse = await getMapboxDirections(
        routeCoords as [number, number][]
      );
      setAllDirections(directionsResponse);
    };
    doFetch();
  }, [routeCoords]);

  // Select best route and check for warnings whenever allDirections OR targetDuration changes
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  useEffect(() => {
    if (allDirections && allDirections.routes) {
      console.log(
        `DirectionsForm: Found ${allDirections.routes.length} routes.`
      );
      const bestRoute = findBestRoute(allDirections.routes, targetDuration);

      if (bestRoute) {
        console.log(
          `DirectionsForm: Selected route duration: ${
            bestRoute.duration / 60
          } min (Target: ${targetDuration})`
        );
        // Find index of best route
        const index = allDirections.routes.indexOf(bestRoute);
        setSelectedRouteIndex(index !== -1 ? index : 0);
        setRouteData(allDirections); // Keep all routes
      } else {
        setRouteData(allDirections);
        setSelectedRouteIndex(0);
      }
    } else {
      setRouteData(null);
      setSelectedRouteIndex(0);
    }
  }, [allDirections, targetDuration]);

  const actualDurationMinutes = useMemo(() => {
    if (!routeData?.routes?.[selectedRouteIndex]) return 0;
    return Math.round(routeData.routes[selectedRouteIndex].duration / 60);
  }, [routeData, selectedRouteIndex]);

  const isExceedingTarget = actualDurationMinutes > targetDuration;

  // Visualize Route
  useRouteLayer(map.current, routeData, selectedRouteIndex);

  // Auto-fit map viewport to show entire route (focus on selected)
  const selectedRouteGeoJSON = useMemo(() => {
    if (!routeData?.routes?.[selectedRouteIndex]) return null;
    return {
      ...routeData,
      routes: [routeData.routes[selectedRouteIndex]],
    };
  }, [routeData, selectedRouteIndex]);

  useFitBounds(map.current, selectedRouteGeoJSON);

  const handleRetrieve = (res: SearchBoxRetrieveResponse) => {
    const item = res.features[0];
    const [lng, lat] = item.geometry.coordinates;
    setRoute((prevValue) => [...prevValue, item]);
    if (map.current) {
      new Marker({}).setLngLat([lng, lat]).addTo(map.current);
    }
  };

  const handleStartSelect = (res: SearchBoxRetrieveResponse) => {
    const item = res.features[0];
    setManualStart(item);
    const [lng, lat] = item.geometry.coordinates;
    if (map.current) {
      new Marker({ color: "green" }).setLngLat([lng, lat]).addTo(map.current);
    }
  };

  const handleDeleteItem = (id: string) => {
    const filteredItems = route.filter(
      (routeItem) => routeItem.properties.mapbox_id !== id
    );
    setRoute(filteredItems);
  };

  const handleReorder = (reorderedRoute: SearchBoxFeatureSuggestion[]) => {
    setRoute(reorderedRoute);
  };

  return (
    <>
      <form className={styles.form}>
        <SearchBox
          accessToken={process.env.MAP_BOX_API_KEY!}
          map={map.current}
          onRetrieve={handleRetrieve}
          placeholder="Where would you like to go?"
          theme={{
            variables: {
              unit: "var(--searchbox-unit)",
              borderRadius: "var(--searchbox-borderRadius)",
              border: "var(--searchbox-border)",
              boxShadow: "var(--searchbox-boxShadow)",
              padding: "var(--searchbox-padding)",
            },
          }}
        />

        <div className={styles["slider-container"]}>
          <p className={styles["slider-label"]}>Target Duration (minutes)</p>
          <input
            type="range"
            min="0"
            max="120"
            value={targetDuration}
            onChange={(e) => setTargetDuration(parseInt(e.target.value))}
            className={styles["slider-input"]}
          />
          <div className={styles["slider-values"]}>
            <span>0 min</span>
            <div className={styles["duration-display"]}>
              <span className={styles["current-value"]}>
                Target: {targetDuration} min
              </span>
            </div>
            <span>120 min</span>
          </div>
          {isExceedingTarget && (
            <div className={styles["warning-message"]}>
              ⚠️ Route is longer than target duration
            </div>
          )}
        </div>
      </form>
      <DragAndDropRoutes
        route={route}
        onDelete={handleDeleteItem}
        onReorder={handleReorder}
        curPos={curPos}
        manualStart={manualStart}
        onStartSelect={handleStartSelect}
        isExceedingTarget={isExceedingTarget}
        actualDurationMinutes={actualDurationMinutes}
        routes={allDirections?.routes}
        selectedRouteIndex={selectedRouteIndex}
        onRouteSelect={setSelectedRouteIndex}
      />
    </>
  );
}
