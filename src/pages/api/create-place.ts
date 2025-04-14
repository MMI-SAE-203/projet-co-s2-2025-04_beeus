import type { APIRoute } from "astro";
import { pb, createPlace, createNotation } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  const contentTypeJson = { "Content-Type": "application/json" };

  try {
    const token = request.headers.get("cookie")?.match(/pb_auth=([^;]+)/)?.[1];

    if (!token) {
      return new Response(JSON.stringify({ error: "Token manquant dans le cookie" }), {
        status: 401,
        headers: contentTypeJson,
      });
    }

    pb.authStore.save(token, null);
    await pb.collection("users").authRefresh();

    const userId = pb.authStore.record?.id;
    if (!pb.authStore.isValid || !userId) {
      return new Response(JSON.stringify({ error: "Utilisateur non connecté" }), {
        status: 401,
        headers: contentTypeJson,
      });
    }

    const body = await request.json();
    console.log("📥 Reçu dans API create-place :", body);

    const { location, categories, titre, description, notation } = body;

    if (!location || !titre || !categories || categories.length === 0) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: contentTypeJson,
      });
    }

    const displayName = location.result?.display_name || location.adresse || "Adresse inconnue";

    const created = await createPlace({
      nom: titre,
      adresse: displayName,
      categories: categories,
      description,
      createur: userId,
    });

    if (typeof notation === 'number' && created.id) {
      try {
        await createNotation({
          lieu: created.id,
          user: userId,
          note: notation
        });
      } catch (notationErr) {
        console.error("⚠️ Erreur lors de la création de la notation:", notationErr);
      }
    }

    return new Response(JSON.stringify(created), {
      status: 200,
      headers: contentTypeJson,
    });
  } catch (err: any) {
    console.error("❌ Erreur dans /api/create-place :", err);
    return new Response(JSON.stringify({ error: err.message || "Erreur serveur" }), {
      status: 500,
      headers: contentTypeJson,
    });
  }
};