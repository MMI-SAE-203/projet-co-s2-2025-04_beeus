export async function GET({ url }: { url: URL }) {
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
  
    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "Missing lat or lon" }), { status: 400 });
    }
  
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`;
  
    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "BeeUsApp/1.0 (https://beeus.fr contact@beeus.fr)"
      },
    });
  
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Nominatim error" }), { status: res.status });
    }
  
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  