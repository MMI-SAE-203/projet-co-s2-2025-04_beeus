import type { APIRoute } from "astro";
import { getLocationCategories } from "../../lib/pocketbase.mjs";

export const GET: APIRoute = async () => {
  try {
    const categories = await getLocationCategories();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Erreur dans /api/categories :", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
