import { NextResponse } from "next/server";

const MATRIX_API_URL =
  "https://api.mapbox.com/directions-matrix/v1/mapbox/driving-traffic";
const DIRECTIONS_API_URL =
  "https://api.mapbox.com/directions/v5/mapbox/driving";

import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;

  // Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  switch (slug[0]) {
    case "directions-matrix":
      try {
        const coords = await request.text();
        const token =
          process.env.MAPBOX_SECRET_TOKEN || process.env.MAP_BOX_API_KEY;
        const res = await fetch(
          `${MATRIX_API_URL}/${coords}?access_token=${token}`
        );
        if (res.ok) {
          const json = await res.json();
          return Response.json({ data: json });
        }
        return new NextResponse(await res.text(), { status: res.status });
      } catch (error) {
        console.error(
          `There was an error fetching from MapboxMatrixAPI: ${error}`
        );
        return new NextResponse("Internal Server Error", { status: 500 });
      }

    case "directions":
      try {
        const coords = await request.text();
        const token =
          process.env.MAPBOX_SECRET_TOKEN || process.env.MAP_BOX_API_KEY;
        // We request geojson geometries and alternatives=true (for later Phases)
        const query = `geometries=geojson&overview=full&alternatives=true&steps=true&banner_instructions=true&access_token=${token}`;
        const res = await fetch(`${DIRECTIONS_API_URL}/${coords}?${query}`);
        if (res.ok) {
          const json = await res.json();
          return Response.json({ data: json });
        }
        return new NextResponse(await res.text(), { status: res.status });
      } catch (error) {
        console.error(
          `There was an error fetching from MapboxDirectionsAPI: ${error}`
        );
        return new NextResponse("Internal Server Error", { status: 500 });
      }

    default:
      return new NextResponse();
  }
}
