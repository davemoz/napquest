export type Route = {
  geometry: any;
  duration: number; // in seconds
  distance: number;
  weight_name: string;
  legs: any[];
};

/**
 * Finds the route that is closest to the target duration.
 * @param routes List of routes from Mapbox Directions API
 * @param targetDurationMinutes Target duration in minutes
 * @returns The best matching route object
 */
export default function findBestRoute(
  routes: Route[],
  targetDurationMinutes: number
): Route | null {
  if (!routes || routes.length === 0) return null;

  const targetSeconds = targetDurationMinutes * 60;

  // Sort routes by absolute difference from target duration
  const sortedRoutes = [...routes].sort((a, b) => {
    const diffA = Math.abs(a.duration - targetSeconds);
    const diffB = Math.abs(b.duration - targetSeconds);
    return diffA - diffB;
  });

  return sortedRoutes[0];
}
