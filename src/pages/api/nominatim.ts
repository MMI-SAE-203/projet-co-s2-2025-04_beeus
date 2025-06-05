// /src/pages/api/nominatim.ts
export async function GET({ url }: { url: URL }) {
    const q = url.searchParams.get("q");
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
  
    if (!q && (!lat || !lon)) {
      return new Response(JSON.stringify({ error: "Missing query or coords" }), { status: 400 });
    }
  
    const isReverse = lat && lon && !q;
    const base = isReverse
      ? `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`
      : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q || '')}&limit=10&addressdetails=1&accept-language=fr`;
  
    const response = await fetch(base, {
      headers: { "User-Agent": "BeeUsApp/1.0 (https://beeus.fr contact@beeus.fr)" },
    });
  
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  