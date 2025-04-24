import { updateUserFavoritePlace } from "../../lib/pocketbase.mjs";

export async function POST({ request } : { request: Request }) {
  try {
    const { userId, placeId } = await request.json();
    if (!userId || !placeId) {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
      });
    }
    const updated = await updateUserFavoritePlace(userId, placeId);
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur dans /api/toggle-place-favorite:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
