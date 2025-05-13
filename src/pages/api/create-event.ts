import type { APIRoute } from "astro";
import { pb, createEvent } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  const contentTypeJson = { "Content-Type": "application/json" };

  try {
    console.log("🔄 [API] Requête reçue pour la création d'un événement");

    const token = request.headers.get("cookie")?.match(/pb_auth=([^;]+)/)?.[1];

    if (!token) {
      console.error("❌ [API] Token manquant dans le cookie");
      return new Response(JSON.stringify({ error: "Token manquant dans le cookie" }), {
        status: 401,
        headers: contentTypeJson,
      });
    }

    pb.authStore.save(token, null);
    await pb.collection("users").authRefresh();

    if (!pb.authStore.isValid || !pb.authStore.model?.id) {
      console.error("❌ [API] Utilisateur non connecté");
      return new Response(JSON.stringify({ error: "Utilisateur non connecté" }), {
        status: 401,
        headers: contentTypeJson,
      });
    }

    const body = await request.json();
    console.log("🔄 [API] Corps de la requête :", body);

    const { place, categories, titre, date_heure, participants_max, description } = body;

    if (!place || !categories?.length || !titre) {
      console.error("❌ [API] Champs manquants :", {
        place,
        categories,
        titre,
      });
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400,
        headers: contentTypeJson,
      });
    }

    // Utiliser le champ 'adresse' ou 'formattedAddress' envoyé depuis le frontend
    const displayName = place.adresse || place.formattedAddress || place.name || "Adresse inconnue";

    const formData = new FormData();
    formData.append("nom", titre);
    formData.append("titre", titre);
    formData.append("adresse", displayName);
    formData.append("categories", JSON.stringify(categories));
    formData.append("createur", pb.authStore.model.id);
    formData.append("date_heure", date_heure);
    formData.append("participants_max", participants_max.toString());
    formData.append("description", description);

    console.log("📦 [API] FormData créé :", {
      nom: titre,
      adresse: displayName,
      categories,
      date_heure,
      participants_max,
      description,
    });

    const created = await createEvent(formData);

    console.log("🎉 [API] Événement créé avec succès :", created);

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
