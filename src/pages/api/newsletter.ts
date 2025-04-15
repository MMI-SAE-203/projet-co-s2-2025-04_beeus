import type { APIRoute } from "astro";
import { isEtudiantEmail, addToNewsletter } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ message: "Email invalide." }), {
        status: 400,
      });
    }

    const etudiant = isEtudiantEmail(email);
    const result = await addToNewsletter({ email, etudiant });

    if (result.success) {
      return new Response(
        JSON.stringify({ message: "Merci pour votre inscription !" }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ message: "Cet email est déjà inscrit." }),
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("❌ Erreur API /newsletter :", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur, réessaye plus tard." }),
      { status: 500 }
    );
  }
};
