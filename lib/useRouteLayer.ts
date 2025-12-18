import { useEffect } from "react";
import { Map, GeoJSONSource } from "mapbox-gl";

export default function useRouteLayer(
  map: Map | null,
  routeData: any // The full response from Directions API
) {
  useEffect(() => {
    if (
      !map ||
      !routeData ||
      !routeData.routes ||
      routeData.routes.length === 0
    ) {
      // optionally clear layer if no route
      if (map && map.getSource("route")) {
        // We could set empty data, but for now let's just leave it or clear it.
        (map.getSource("route") as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [],
        });
      }
      return;
    }

    const route = routeData.routes[0];
    const geojson = {
      type: "Feature",
      properties: {},
      geometry: route.geometry,
    };

    if (map.getSource("route")) {
      (map.getSource("route") as GeoJSONSource).setData(geojson as any);
    } else {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: geojson as any,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ff7644",
          "line-width": 5,
          "line-opacity": 1,
        },
      });
    }
  }, [map, routeData]);
}
