import type { APIRoute } from "astro";
import { createContactMessage } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const nom = formData.get("nom")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const objet = formData.get("objet")?.toString() || "";
  const message = formData.get("message")?.toString() || "";

  if (!nom || !email || !objet || !message) {
    return new Response("Champs requis manquants.", { status: 400 });
  }

  try {
    await createContactMessage({ nom, email, objet, message });
    return redirect("/contact?success=1");
  } catch (err) {
    console.error("❌ Erreur envoi formulaire :", err);
    return new Response("Erreur interne", { status: 500 });
  }
};
