import { RefObject, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Map } from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAP_BOX_API_KEY;

export default function useMapboxGL(
  containerRef?: RefObject<null> | undefined
) {
  const mapInstanceRef = useRef<Map | null>(null);
  const [curPos, setCurPos] = useState<number[] | undefined>();

  useEffect(() => {
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
