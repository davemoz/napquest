import { describe, it, expect } from "vitest";
import { generateDetourWaypoints } from "./generateWaypoints";
import * as turf from "@turf/turf";

describe("generateDetourWaypoints", () => {
  // San Francisco to San Jose (approx 1 hour driving)
  // SF: [-122.4194, 37.7749]
  // SJ: [-121.8863, 37.3382]
  const sf: [number, number] = [-122.4194, 37.7749];
  const sj: [number, number] = [-121.8863, 37.3382];
  const currentDurationSec = 3600; // 1 hour

  it("returns empty array if target duration is close to current duration", () => {
    const waypoints = generateDetourWaypoints(sf, sj, currentDurationSec, 3700);
    expect(waypoints).toEqual([]);
  });

  it("returns waypoints if target duration is significantly longer", () => {
    // Target 2 hours (double the time)
    const waypoints = generateDetourWaypoints(sf, sj, currentDurationSec, 7200);

    expect(waypoints.length).toBeGreaterThan(0);
    // We expect at least 2 detour options (left and right) for each distance tier
    // Current implementation generates 3 distances * 2 directions = 6 waypoints
    expect(waypoints.length).toBe(6);
  });

  it("waypoints are mostly equidistant from start and end (on the bisector)", () => {
    const waypoints = generateDetourWaypoints(sf, sj, currentDurationSec, 7200);
    const wp = waypoints[0];

    const distStart = turf.distance(turf.point(sf), turf.point(wp));
    const distEnd = turf.distance(turf.point(sj), turf.point(wp));

    // They should be roughly equal (floating point tolerance)
    expect(Math.abs(distStart - distEnd)).toBeLessThan(1); // within 1km
  });
});
