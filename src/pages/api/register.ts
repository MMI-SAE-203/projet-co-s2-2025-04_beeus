import type { APIRoute } from "astro";
import { register } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();
    const result = await register(email, password, username);

    if (result.success) {
      return new Response(JSON.stringify(result.data), { status: 200 });
    } else {
      return new Response(
        JSON.stringify({ error: (result.error as any)?.message || "Erreur register" }),
        { status: 400 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
