import { NextResponse } from "next/server";

const MATRIX_API_URL =
  "https://api.mapbox.com/directions-matrix/v1/mapbox/driving-traffic";
const DIRECTIONS_API_URL =
  "https://api.mapbox.com/directions/v5/mapbox/driving";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  switch (slug[0]) {
    case "directions-matrix":
      try {
        const coords = await request.text();
        const res = await fetch(
          `${MATRIX_API_URL}/${coords}?access_token=${process.env.MAP_BOX_API_KEY}`
        );
        if (res.ok) {
          const json = await res.json();
          return Response.json({ data: json });
        }
      } catch (error) {
        console.error(
          `There was an error fetching from MapboxMatrixAPI: ${error}`
        );
      }
      break;

    case "directions":
      try {
        const coords = await request.text();
        // We request geojson geometries and alternatives=true (for later Phases)
        const query = `geometries=geojson&overview=full&alternatives=true&access_token=${process.env.MAP_BOX_API_KEY}`;
        const res = await fetch(`${DIRECTIONS_API_URL}/${coords}?${query}`);
        if (res.ok) {
          const json = await res.json();
          return Response.json({ data: json });
        }
      } catch (error) {
        console.error(
          `There was an error fetching from MapboxDirectionsAPI: ${error}`
        );
      }
      break;

    default:
      return new NextResponse();
  }
}
