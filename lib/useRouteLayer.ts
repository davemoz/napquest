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
            "#cccccc", // Alternative color
          ],
          "line-width": [
            "case",
            ["get", "isSelected"],
            5, // Selected width
            20, // Alternative width (invisible hit area, visual width controlled by opacity/color effectively, but actually we want visible width to be similar, maybe slightly thicker for hit target?)
            // Actually, let's keep it simple. Standard width.
            // If we want easier clicking, we might need a separate transparent wide layer.
            // For now, let's just make the unselected ones 7px wide but visually same color logic?
            // Wait, the previous logic was:
            // Selected: 5
            // Alternative: 4
            // Let's stick to that, maybe bump a bit for easier clicking?
          ],
          "line-opacity": [
            "case",
            ["get", "isSelected"],
            1, // Selected opacity
            0.6, // Alternative opacity
          ],
        },
      });

      // Add interactions
      map.on("mouseenter", "route", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "route", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    // We need to update the listener if the callback changes or ensure it's robust
    // Mapbox listeners are persistent. We should define the handler outside or remove/add.
    // Simplest way is to remove old one and add new one, but that's messy with anonymous functions.
    // Let's define a named handler inside the effect.

    const handleClick = (e: any) => {
      if (e.features && e.features.length > 0) {
        const index = e.features[0].properties.index;
        if (typeof index === "number" && onRouteSelect) {
          onRouteSelect(index);
        }
      }
    };

    map.on("click", "route", handleClick);

    return () => {
      map.off("click", "route", handleClick);
      // We don't strictly need to remove mouseenter/leave every time if layer persists,
      // but strictly we should.
      // For now, focusing on click.
    };
  }, [map, routeData, selectedRouteIndex, onRouteSelect]);
}
