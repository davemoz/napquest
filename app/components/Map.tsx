"use client";

import { useRef } from "react";

import Branding from "./Branding";
import DirectionsForm from "./DirectionsForm";
import getMapboxGL from "@/lib/useMapboxGL";

const Map = ({
  mapClassName,
  sidebarClassName,
}: {
  mapClassName: string;
  sidebarClassName: string;
}) => {
  const mapRef = useRef(null);
  const { map, curPos } = getMapboxGL(mapRef);
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
