export default async function getMapboxDirections(
  routeCoords: [number, number][]
): Promise<any | undefined> {
  if (!(routeCoords.length >= 2)) return;
  const coords = routeCoords?.reduce((acc, coordPair, idx, arr) => {
    if (idx === arr.length - 1) {
      return `${acc}${coordPair[0]},${coordPair[1]}`;
    } else {
      return `${acc}${coordPair[0]},${coordPair[1]};`;
    }
  }, "");

  const url = `/api/directions`;
  try {
    const res = await fetch(url, {
      body: coords,
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.code === "Ok") {
        return json.data;
      }
    }
  } catch (error: any) {
    console.error(
      `There was an error fetching from the route handler: ${error.message}`
    );
  }
}
