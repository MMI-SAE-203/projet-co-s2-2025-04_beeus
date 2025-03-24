import type { APIRoute } from "astro";
import { getOneUser } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId } = await request.json();
    console.log("📩 Requête reçue pour /api/user avec userId :", userId);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      );
    }

    const user = await getOneUser(userId);

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Erreur dans /api/user :", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
