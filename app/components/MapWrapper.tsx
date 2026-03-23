"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapWrapper({
  mapClassName,
  sidebarClassName,
  mapboxToken,
}: {
  mapClassName: string;
  sidebarClassName: string;
  mapboxToken: string;
}) {
  return (
    <Map mapClassName={mapClassName} sidebarClassName={sidebarClassName} mapboxToken={mapboxToken} />
  );
}
