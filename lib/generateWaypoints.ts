import * as turf from "@turf/turf";

/**
 * Generates detour waypoints to force a longer route.
 * It calculates points perpendicular to the mid-point of the start-end segment.
 *
 * @param start - [lng, lat]
 * @param end - [lng, lat]
 * @param currentDurationSec - duration of the direct route in seconds
 * @param targetDurationSec - target duration in seconds
 * @returns Array of [lng, lat] waypoints
 */
export function generateDetourWaypoints(
  start: [number, number],
  end: [number, number],
  currentDurationSec: number,
  targetDurationSec: number
): [number, number][] {
  if (targetDurationSec <= currentDurationSec * 1.1) {
    return [];
  }

  // Calculate roughly how much extra distance we need.
  // Assuming 60km/h average speed (1 km/min).
  // This is a rough heuristic.
  const timeDiffMinutes = (targetDurationSec - currentDurationSec) / 60;

  // We want to add this much "length" to the trip.
  // A simple detour distance (perpendicular offset) can be estimated.
  // If we go to a point D units away from midpoint and back:
  // Extra distance ~ 2 * sqrt((L/2)^2 + D^2) - L
  // This is hard to inverse perfectly without L, so let's use a simpler heuristic.
  // We will try 3 different magnitudes of deviation to give options.

  // Base offset unit: 1 minute diff ~ 1km offset.
  // We'll generate a few candidates.

  const midPoint = turf.midpoint(turf.point(start), turf.point(end));
  const bearing = turf.bearing(turf.point(start), turf.point(end));

  // Perpendicular bearings
  const bearingLeft = bearing - 90;
  const bearingRight = bearing + 90;

  const waypoints: [number, number][] = [];

  // Factor 1: Small detour (approx 25% of the time diff converted to km)
  // Factor 2: Medium detour (approx 50%)
  // Factor 3: Large detour (approx 75%)

  // We clamp minimum detour to 5km to ensure it actually routes differently
  // And max to something reasonable (e.g. 100km) to avoid crossing oceans/borders absurdly.
  const baseDistanceKm = Math.max(5, Math.min(timeDiffMinutes * 0.5, 100));

  const distances = [
    baseDistanceKm * 0.5,
    baseDistanceKm,
    baseDistanceKm * 1.5,
  ];

  distances.forEach((dist) => {
    const destLeft = turf.destination(midPoint, dist, bearingLeft);
    const destRight = turf.destination(midPoint, dist, bearingRight);

    // Validate coordinates (basic check)
    if (destLeft.geometry.coordinates)
      waypoints.push(destLeft.geometry.coordinates as [number, number]);
    if (destRight.geometry.coordinates)
      waypoints.push(destRight.geometry.coordinates as [number, number]);
  });

  return waypoints;
}
