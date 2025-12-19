import getMapboxDirections from "./getMapboxDirections";
import { generateDetourWaypoints } from "./generateWaypoints";

type Route = {
  geometry: any;
  duration: number; // seconds
  distance: number;
  weight_name: string;
  legs: any[];
};

export type ExtendedRouteResponse = {
  routes: Route[];
  waypoints: any[];
  code: string;
  uuid: string;
};

/**
 * Fetches routes, and if the best route is significantly shorter than target,
 * fetches additional "detour" routes.
 */
export async function fetchExtendedRoutes(
  routeCoords: [number, number][],
  targetDurationMinutes: number
): Promise<ExtendedRouteResponse> {
  const targetDurationSec = targetDurationMinutes * 60;

  // 1. Fetch standard routes (direct)
  const directResponse = await getMapboxDirections(routeCoords);

  if (
    !directResponse ||
    !directResponse.routes ||
    directResponse.routes.length === 0
  ) {
    return directResponse; // Return error or empty as is
  }

  let finalRoutes: Route[] = [...directResponse.routes];

  // Get the duration of the best direct route (usually the first one)
  const bestDirectDuration = directResponse.routes[0].duration;

  // 2. Check if we need to extend
  // If we are within 10% or if target is smaller, no need to force detour.
  if (targetDurationSec <= bestDirectDuration * 1.1) {
    return directResponse;
  }

  console.log(
    `[NapQuest] Target ${targetDurationMinutes}m exceeds best route ${Math.round(
      bestDirectDuration / 60
    )}m. Generating detours...`
  );

  // 3. Generate Waypoints
  // We assume routeCoords has at least [start, end]. If there are already waypoints,
  // we might just add to the longest segment, but for now let's assume simple A -> B.
  const start = routeCoords[0];
  const end = routeCoords[routeCoords.length - 1];

  const detourPoints = generateDetourWaypoints(
    start,
    end,
    bestDirectDuration,
    targetDurationSec
  );

  // 4. Fetch routes for each detour waypoint
  // We want to run these in parallel
  const detourPromises = detourPoints.map(async (wp) => {
    // Construct new coords: Start -> Waypoint -> End
    // If the user had intermediate stops, this logic would need to be smarter,
    // inserting the detour in the longest specific leg.
    // For MVP, we treat the whole things as Start -> Detour -> End.
    const newCoords: [number, number][] = [start, wp, end];
    const res = await getMapboxDirections(newCoords);
    return res?.routes || [];
  });

  const results = await Promise.all(detourPromises);

  // 5. Combine results
  results.forEach((routes) => {
    finalRoutes = finalRoutes.concat(routes);
  });

  // 6. Deduplicate (optional but good idea)
  // A simple dedup by duration + distance can remove identical routes
  const uniqueRoutes: Route[] = [];
  const seen = new Set<string>();

  finalRoutes.forEach((r) => {
    const key = `${Math.round(r.duration)}-${Math.round(r.distance)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRoutes.push(r);
    }
  });

  // Sort by closeness to target duration?
  // Actually, standard Mapbox response sorts by 'best' (fastest).
  // The UI selects the "Best Fit" automatically, so we just return the pile.
  // But maybe we should sort them so index 0 is the "best fit" instead of "fastest"?
  // The current UI logic in DirectionsForm selects the best fit, so we can just return the list.

  return {
    ...directResponse,
    routes: uniqueRoutes,
  };
}
