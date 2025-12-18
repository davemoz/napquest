import { useEffect } from "react";
import { Map, LngLatBounds } from "mapbox-gl";

/**
 * Custom hook to automatically fit the map viewport to show the entire route
 * @param map - Mapbox GL Map instance
 * @param routeData - Route data from Mapbox Directions API
 */
export default function useFitBounds(map: Map | null, routeData: unknown) {
  useEffect(() => {
    if (!map || !routeData) return;

    // Type guard to ensure routeData has the expected structure
    const data = routeData as {
      routes?: Array<{
        geometry?: {
          coordinates?: Array<[number, number]>;
        };
      }>;
    };

    if (
      !data.routes ||
      data.routes.length === 0 ||
      !data.routes[0].geometry ||
      !data.routes[0].geometry.coordinates ||
      data.routes[0].geometry.coordinates.length === 0
    ) {
      return;
    }

    const coordinates = data.routes[0].geometry.coordinates;

    // Create bounds object
    const bounds = new LngLatBounds();

    // Extend bounds to include all coordinates
    coordinates.forEach((coord) => {
      bounds.extend(coord);
    });

    // Fit map to bounds with padding and smooth animation
    map.fitBounds(bounds, {
      padding: 80,
      duration: 1000,
      maxZoom: 15, // Prevent zooming in too close for short routes
    });
  }, [map, routeData]);
}
