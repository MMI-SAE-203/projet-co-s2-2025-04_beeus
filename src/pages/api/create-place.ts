import type { APIRoute } from "astro";
import { pb, createPlace, createNotation } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = request.headers.get("cookie")?.match(/pb_auth=([^;]+)/)?.[1];

    if (!token) {
      return new Response(JSON.stringify({ error: "Token manquant dans le cookie" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    pb.authStore.save(token, null);
    await pb.collection("users").authRefresh();

    const userId = pb.authStore.record?.id;
    if (!pb.authStore.isValid || !userId) {
      return new Response(JSON.stringify({ error: "Utilisateur non connecté" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();

    const dataRaw = formData.get("data");
    if (!dataRaw) {
      return new Response(JSON.stringify({ error: "Données manquantes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = JSON.parse(dataRaw.toString());
    const { location, categories, titre, description, notation } = data;

    if (!location || !titre || !categories || categories.length === 0) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const displayName = location.result?.display_name || location.adresse || "Adresse inconnue";

    // On prépare un objet FormData pour PocketBase
    const pbFormData = new FormData();
    pbFormData.append("nom", titre);
    pbFormData.append("adresse", displayName);
    pbFormData.append("description", description);
    pbFormData.append("createur", userId);

    categories.forEach((catId:any) => pbFormData.append("categories", catId));

    const images = formData.getAll("images") as File[];
    images.forEach((file) => {
      pbFormData.append("images", file, file.name);
    });

    const created = await createPlace(pbFormData);

    if (typeof notation === "number" && created.id) {
      try {
        await createNotation({
          lieu: created.id,
          user: userId,
          note: notation,
        });
      } catch (notationErr) {
        console.error("⚠️ Erreur lors de la création de la notation:", notationErr);
      }
    }

    return new Response(JSON.stringify(created), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Erreur dans /api/create-place :", err);
    return new Response(JSON.stringify({ error: err.message || "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
