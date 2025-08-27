export type MapboxMatrixType = {
  destinations: [
    {
      name: string;
      location: number[];
      distance: number;
    }
  ];
  durations: [number[]][];
};

export default async function getMapboxMatrix(
  routeCoords: [number, number][]
): Promise<MapboxMatrixType | undefined> {
  if (!(routeCoords.length >= 2)) return;
  const coords = routeCoords?.reduce((acc, coordPair, idx, arr) => {
    if (idx === arr.length - 1) {
      return `${acc}${coordPair[0]},${coordPair[1]}`;
    } else {
      return `${acc}${coordPair[0]},${coordPair[1]};`;
    }
  }, "");
  const url = `/api/directions-matrix`;
  try {
    const res = await fetch(url, {
      body: coords,
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data.code === "Ok") {
        return {
          destinations: json.data.destinations,
          durations: json.data.durations,
        };
      }
    }
  } catch (error: any) {
    console.error(
      `There was an error fetching from the route handler: ${error.message}`
    );
  }
}
