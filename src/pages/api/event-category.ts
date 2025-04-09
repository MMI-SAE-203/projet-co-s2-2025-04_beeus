import type { APIRoute } from "astro";
import { getEventCategories } from "../../lib/pocketbase.mjs";

export const GET: APIRoute = async () => {
  try {
    const categories = await getEventCategories();
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Erreur dans /api/event-category :", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
