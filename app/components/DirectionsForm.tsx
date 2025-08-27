"use client";

import { useEffect, useState, useMemo } from "react";
import { Spinner } from "@chakra-ui/react";
import { SearchBox } from "@mapbox/search-js-react";

import DragAndDropRoutes from "./DragAndDropRoutes";
import getMapboxMatrix, { MapboxMatrixType } from "@/lib/getMapboxMatrix";

import {
  SearchBoxRetrieveResponse,
  SearchBoxFeatureSuggestion,
} from "@mapbox/search-js-core";

import styles from "./DirectionsForm.module.scss";
import { Marker } from "mapbox-gl";

type DestinationType = {
  name: string;
  location: number[];
  distance: number;
};

export default function DirectionsForm({
  map,
  curPos,
}: {
  map: any;
  curPos: number[];
}) {
  const [route, setRoute] = useState<SearchBoxFeatureSuggestion[]>([]);
  const routeCoords = useMemo(
    () => route.map((item) => item.geometry.coordinates),
    [route]
  );
  const [routeMatrix, setRouteMatrix] = useState<
    MapboxMatrixType | undefined
  >();

  useEffect(() => {
    if (routeCoords.length === 0) return;
    const doFetch = async () => {
      const routeMatrix = await getMapboxMatrix(
        routeCoords as [number, number][]
      );
      setRouteMatrix(routeMatrix);
    };
    doFetch();
  }, [routeCoords]);

  const handleRetrieve = (res: SearchBoxRetrieveResponse) => {
    const item = res.features[0];
    const [lng, lat] = item.geometry.coordinates;
    setRoute((prevValue) => [...prevValue, item]);
    const marker = new Marker({}).setLngLat([lng, lat]).addTo(map);
  };

  const handleDeleteItem = (id: string) => {
    const filteredItems = route.filter(
      (routeItem) => routeItem.properties.mapbox_id !== id
    );
    setRoute(filteredItems);
  };

  return (
    <>
      <form className={styles.form}>
        <div className={styles.directions}>
          Enter a destination below to begin your nap planning.
        </div>
        {/* @ts-ignore */}
        <SearchBox
          // @ts-ignore
          accessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
          className={styles.search}
          map={map}
          onRetrieve={handleRetrieve}
          placeholder="Where would you like to go?"
        />
      </form>
      <DragAndDropRoutes
        route={route}
        onDelete={handleDeleteItem}
        map={map}
        curPos={curPos}
      />
      {routeMatrix && (
        <div className={styles.routeMatrix}>
          {routeMatrix.destinations.map(
            (destination: DestinationType, idx: number) => {
              const duration = routeMatrix.durations[idx];
              if (idx === 0) {
                return (
                  <div key={destination.distance}>{`${destination.name}`}</div>
                );
              } else {
                return (
                  <div
                    key={destination.name}
                  >{`${destination.name} - Duration: ${duration}`}</div>
                );
              }
            }
          )}
        </div>
      )}
    </>
  );
}
