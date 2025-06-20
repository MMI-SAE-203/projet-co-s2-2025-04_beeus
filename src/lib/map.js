function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function filterByDistance(items, centerCoords, radiusKm) {
  if (!Array.isArray(items) || !centerCoords || typeof radiusKm !== "number") {
    return [];
  }
  const { lat: centerLat, lon: centerLon } = centerCoords;
  let nearbyCount = 0;
  const filtered = items.filter((item) => {
    if (typeof item.lat !== "number" || typeof item.lon !== "number") {
      return false;
    }
    const distance = getDistanceFromLatLonInKm(
      centerLat,
      centerLon,
      item.lat,
      item.lon
    );
    const isNearby = distance <= radiusKm;
    if (isNearby) nearbyCount++;
    return isNearby;
  });
  return filtered;
}

export async function searchWithOverpass(key, value, lat, lon, radiusInMeters) {
  let queryPart;
  const around = `(around:${radiusInMeters},${lat},${lon})`;
  if (value === undefined && key.includes("][")) {
    queryPart = `node[${key}]${around}; way[${key}]${around}; relation[${key}]${around};`;
  } else if (value === null) {
    queryPart = `node[${key}]${around}; way[${key}]${around}; relation[${key}]${around};`;
  } else {
    const operator = String(value).startsWith("~") ? "" : "=";
    queryPart = `node[${key}${operator}${value}]${around}; way[${key}${operator}${value}]${around}; relation[${key}${operator}${value}]${around};`;
  }
  const overpassQuery = `[out:json][timeout:25];(${queryPart});out center;`;
  const encodedQuery = encodeURIComponent(overpassQuery);
  const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(
        `❌ Map.js ERREUR : requête Overpass échouée : ${res.status} ${res.statusText}`,
        await res.text().catch(() => "")
      );
      return [];
    }
    const data = await res.json();
    return data.elements || [];
  } catch (error) {
    console.error(
      "❌ Map.js ERREUR : échec de la récupération Overpass :",
      error
    );
    return [];
  }
}
export async function searchWithNominatim(query, coords = null, limit = 10) {
  try {
    const url = new URL("/api/nominatim", window.location.origin);
    url.searchParams.set("q", query);
    if (coords) {
      url.searchParams.set("lat", coords.lat);
      url.searchParams.set("lon", coords.lon);
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Map.js ERROR: Nominatim fetch failed:", err);
    return [];
  }
}
