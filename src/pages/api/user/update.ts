import type { APIRoute } from "astro";
import { updateUser } from "../../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId, data } = await request.json();
    const result = await updateUser(userId, data);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
