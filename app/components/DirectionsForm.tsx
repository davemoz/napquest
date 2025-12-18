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

  const [routeData, setRouteData] = useState<any>();

  useEffect(() => {
    if (routeCoords.length < 2) return;
    const doFetch = async () => {
      // Fetch Directions (Geometry)
      const directionsResponse = await getMapboxDirections(
        routeCoords as [number, number][]
      );

      // If directionsResponse contains routes (it should be the full JSON response from our API proxy which returns res.json())
      // Our API proxy returns the full Mapbox response object: { routes: [], ... }
      if (directionsResponse && directionsResponse.routes) {
        const bestRoute = findBestRoute(
          directionsResponse.routes,
          targetDuration
        );
        // We need to shape this like the expected GeoJSON feature for useRouteLayer??
        // useRouteLayer expects: { type: 'Feature', geometry: ... } OR the raw route object?
        // getMapboxDirections previously returned the response.json().
        // useRouteLayer handles the route object specifically?
        // Let's check useRouteLayer.ts.
        // It does: const geometry = routeData.routes[0].geometry;
        // So it expects the FULL response object.

        // We will construct a fake response object containing ONLY the best route to trick useRouteLayer
        // so it renders that specific one.
        if (bestRoute) {
          setRouteData({ ...directionsResponse, routes: [bestRoute] });
        } else {
          setRouteData(directionsResponse);
        }
      }
    };
    doFetch();
  }, [routeCoords, targetDuration]); // Re-run when target duration changes

  // Visualize Route
  useRouteLayer(map.current, routeData);

  // Auto-fit map viewport to show entire route
  useFitBounds(map.current, routeData);

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
          accessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY!}
          map={map.current}
          onRetrieve={handleRetrieve}
          placeholder="Where would you like to go?"
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
            <span className={styles["current-value"]}>
              {targetDuration} min
            </span>
            <span>120 min</span>
          </div>
        </div>
      </form>
      <DragAndDropRoutes
        route={route}
        onDelete={handleDeleteItem}
        onReorder={handleReorder}
        curPos={curPos}
        manualStart={manualStart}
        onStartSelect={handleStartSelect}
      />
    </>
  );
}
