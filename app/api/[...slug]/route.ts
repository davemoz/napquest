import { NextResponse } from "next/server";

const MATRIX_API_URL =
  "https://api.mapbox.com/directions-matrix/v1/mapbox/driving-traffic";

export async function POST(
  request: Request,
  { params: { slug } }: { params: { slug: string } }
) {
  switch (slug[0]) {
    case "directions-matrix":
      try {
        const coords = await request.text();
        const res = await fetch(
          `${MATRIX_API_URL}/${coords}?access_token=${process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}`
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

    default:
      return new NextResponse();
  }
}
