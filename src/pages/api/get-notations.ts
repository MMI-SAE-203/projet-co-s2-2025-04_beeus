import type { APIRoute } from "astro";
import { getOneNotation } from "../../lib/pocketbase.mjs";

export const GET: APIRoute = async ({ url }) => {
  const lieuId = url.searchParams.get("id");

  if (!lieuId) {
    return new Response(
      JSON.stringify({ error: "Paramètre 'id' manquant." }),
      { status: 400 }
    );
  }

  try {
    const moyenne = await getOneNotation(lieuId);
    return new Response(JSON.stringify({ note: moyenne }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Erreur API get-notations :", error);
    return new Response(JSON.stringify({ error: "Erreur interne serveur." }), {
      status: 500,
    });
  }
};