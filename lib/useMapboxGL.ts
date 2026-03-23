import { RefObject, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Map } from "mapbox-gl";

export default function useMapboxGL(
  containerRef: RefObject<HTMLDivElement | null> | undefined,
  mapboxToken: string | undefined
) {
  const mapInstanceRef = useRef<Map | null>(null);
  const [curPos, setCurPos] = useState<number[] | undefined>();

  useEffect(() => {
    if (!mapboxToken) return;
    mapboxgl.accessToken = mapboxToken;

    const container = containerRef?.current;
    if (container) {
      mapInstanceRef.current = new mapboxgl.Map({
        container: container,
        style: "mapbox://styles/mapbox/navigation-night-v1", // see: https://docs.mapbox.com/api/maps/styles/#classic-mapbox-styles
        zoom: 1,
      });

      // Add geolocation control button
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        // showUserHeading: true,
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.addControl(geolocate);
        geolocate.on("geolocate", (data: GeolocationPosition) => {
          setCurPos([data.coords.longitude, data.coords.latitude]);
        });

        mapInstanceRef.current.on("load", () => {
          geolocate.trigger();
          
          // Fallback: request geolocation directly in case Mapbox control fails
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
              setCurPos((prev) => prev || [pos.coords.longitude, pos.coords.latitude]);
            }, (err) => {
              console.warn("Geolocation fallback failed:", err);
            });
          }
        });
      }

      // change cursor to pointer when user hovers over a clickable feature
      // map.on("mouseenter", (e) => {
      //   if (e.features.length) {
      //     map.getCanvas().style.cursor = "pointer";
      //   }
      // });

      // reset cursor to default when user is no longer hovering over a clickable feature
      // map.on("mouseleave", () => {
      //   map.getCanvas().style.cursor = "";
      // });
    }

    // Clean up on unmount
    return () => {
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
    };
  }, [containerRef]);

  return { map: mapInstanceRef, curPos };
}
