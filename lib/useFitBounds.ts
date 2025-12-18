import { useEffect } from "react";
import { Map, LngLatBounds } from "mapbox-gl";

/**
 * Custom hook to automatically fit the map viewport to show the entire route
 * @param map - Mapbox GL Map instance
 * @param routeData - Route data from Mapbox Directions API
 */
export default function useFitBounds(
  map: Map | null,
  routeData: unknown,
  padding:
    | number
    | { top: number; bottom: number; left: number; right: number } = 80
) {
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

    if (!data.routes || data.routes.length === 0) {
      return;
    }

    // Create bounds object
    const bounds = new LngLatBounds();
    let hasValidCoords = false;

    // Extend bounds to include all coordinates from ALL routes
    data.routes.forEach((route) => {
      if (route.geometry?.coordinates) {
        route.geometry.coordinates.forEach((coord) => {
          bounds.extend(coord);
          hasValidCoords = true;
        });
      }
    });

    if (!hasValidCoords) return;

    // Fit map to bounds with padding and smooth animation
    map.fitBounds(bounds, {
      padding: padding,
      duration: 1000,
      maxZoom: 15, // Prevent zooming in too close for short routes
    });
  }, [map, routeData, padding]); // padding in dependency array might cause re-renders if object literal passed directly.
  // Ideally use deep compare or assume caller memoizes.
  // For now simple Effect dependency is fine as long as DirectionsForm passes stable object or primitive.
}
