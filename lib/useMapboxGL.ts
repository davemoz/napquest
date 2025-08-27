import { MutableRefObject, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAP_BOX_API_KEY;

export default function useMapboxGL(
  containerRef?: MutableRefObject<null> | undefined
) {
  const [map, setMap] = useState<Map | undefined>();
  const [curPos, setCurPos] = useState<number[] | undefined>();

  useEffect(() => {
    let mapGL;
    if (containerRef) {
      mapGL = new mapboxgl.Map({
        container: containerRef.current,
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
      mapGL.addControl(geolocate);
      geolocate.on("geolocate", (data: GeolocationPosition) => {
        setCurPos([data.coords.longitude, data.coords.latitude]);
      });

      mapGL.on("load", () => {
        geolocate.trigger();
      });

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
      setMap(mapGL);
    }

    // Clean up on unmount
    return () => {
      if (mapGL) mapGL.remove();
    };
  }, [containerRef]);

  return [map, curPos];
}
