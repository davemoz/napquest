"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapWrapper({
  mapClassName,
  sidebarClassName,
}: {
  mapClassName: string;
  sidebarClassName: string;
}) {
  return (
    <Map mapClassName={mapClassName} sidebarClassName={sidebarClassName} />
  );
}
