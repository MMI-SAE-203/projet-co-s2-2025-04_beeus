import type { APIRoute } from "astro";
import { login } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    let email = "", password = "";

    // Tenter de lire et parser le JSON
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseErr) {
      return new Response(
        JSON.stringify({ error: "Requête invalide : JSON attendu." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email et mot de passe requis." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await login(email, password);

    if (result.success) {
      const token = result.data!.token;

      return new Response(JSON.stringify(result.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Le cookie d'authentification
          "Set-Cookie": `pb_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        },
      });
    } else {
      console.error("❌ Échec de connexion :", result.error);
      const msg = (result.error as any)?.message || "Erreur de connexion.";
      return new Response(JSON.stringify({ error: msg }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("🔥 Erreur interne dans /api/login :", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
