import type { APIRoute } from "astro";
import { pb, createEvent } from "../../lib/pocketbase.mjs";

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

    if (!pb.authStore.isValid || !pb.authStore.model?.id) {
      return new Response(JSON.stringify({ error: "Utilisateur non connecté" }), {
        status: 401,
        headers: contentTypeJson,
      });
    }

    const { location, categories, titre } = await request.json();
    
    if (!location || !categories?.length) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400,
        headers: contentTypeJson,
      });
    }

    const displayName = location.result?.display_name;
    
    const created = await createEvent({
      titre: titre,
      adresse: displayName,
      categories,
    });

    return new Response(JSON.stringify(created), {
      status: 200,
      headers: contentTypeJson,
    });
  } catch (err) {
    console.error("❌ Erreur dans /api/create-event :", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: contentTypeJson,
    });
  }
};