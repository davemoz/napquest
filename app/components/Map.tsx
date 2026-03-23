"use client";

import { useRef } from "react";

import Branding from "./Branding";
import DirectionsForm from "./DirectionsForm";
import getMapboxGL from "@/lib/useMapboxGL";

const Map = ({
  mapClassName,
  sidebarClassName,
  mapboxToken,
}: {
  mapClassName: string;
  sidebarClassName: string;
  mapboxToken: string;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, curPos } = getMapboxGL(mapRef, mapboxToken);
  return (
    <>
      <div className={mapClassName} ref={mapRef} />
      <div className={sidebarClassName}>
        <Branding />
        <DirectionsForm map={map} curPos={curPos} />
      </div>
    </>
  );
};

export default Map;
