import { useEffect } from "react";
import { Map, GeoJSONSource } from "mapbox-gl";

export default function useRouteLayer(
  map: Map | null,
  routeData: any, // The full response from Directions API
  selectedRouteIndex: number = 0,
  onRouteSelect?: (index: number) => void
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
        (map.getSource("route") as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [],
        });
      }
      return;
    }

    // Create a feature for each route
    const features = routeData.routes.map((route: any, index: number) => ({
      type: "Feature",
      properties: {
        isSelected: index === selectedRouteIndex,
        index,
      },
      geometry: route.geometry,
    }));

    // Sort features so the selected one is rendered last (on top)
    features.sort((a: any, b: any) => {
      if (a.properties.isSelected) return 1;
      if (b.properties.isSelected) return -1;
      return 0;
    });

    const geojson = {
      type: "FeatureCollection",
      features: features,
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
          "line-color": [
            "case",
            ["get", "isSelected"],
            "#ff7644", // Selected color
            "#60a5fa", // Alternative color (Blue)
          ],
          "line-width": 6,
          "line-opacity": [
            "case",
            ["get", "isSelected"],
            1, // Selected opacity
            0.5, // Alternative opacity
          ],
        },
      });
    }

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleClick = (e: any) => {
      if (e.features && e.features.length > 0) {
        const index = e.features[0].properties.index;
        if (typeof index === "number" && onRouteSelect) {
          onRouteSelect(index);
        }
      }
    };

    map.on("mouseenter", "route", handleMouseEnter);
    map.on("mouseleave", "route", handleMouseLeave);
    map.on("click", "route", handleClick);

    return () => {
      map.off("mouseenter", "route", handleMouseEnter);
      map.off("mouseleave", "route", handleMouseLeave);
      map.off("click", "route", handleClick);
    };
  }, [map, routeData, selectedRouteIndex, onRouteSelect]);
}
