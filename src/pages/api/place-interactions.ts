import { pb, updatePlaceInteractions } from "../../lib/pocketbase.mjs";
import type { APIRoute } from "astro";

function parseCookie(cookie: string): Record<string, string> {
  return cookie
    .split(";")
    .reduce((acc: Record<string, string>, c: string) => {
      const [key, val] = c.trim().split("=");
      if (key && val) {
        acc[key] = decodeURIComponent(val);
      }
      return acc;
    }, {});
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookie(cookieHeader);
    const token = cookies["pb_auth"];

    if (!token) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    pb.authStore.save(token, null);
    await pb.collection("users").authRefresh();

    if (!pb.authStore.isValid || !pb.authStore.record?.id) {
      return new Response(JSON.stringify({ error: "Session expirée" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = pb.authStore.record.id;
    const payload = await request.json();
    const { placeId } = payload;

    const like = typeof payload.like === "boolean" ? payload.like : undefined;
    const save = typeof payload.save === "boolean" ? payload.save : undefined;
    const share = typeof payload.share === "boolean" ? payload.share : undefined;

    if (!placeId || (like === undefined && save === undefined && share === undefined)) {
      return new Response(JSON.stringify({ error: "Données invalides" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await updatePlaceInteractions({
      userId,
      placeId,
      like:like,
      save:save,
      share:share,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Erreur API place-interactions:", err);
    return new Response(
      JSON.stringify({
        error: "Erreur serveur",
        details: err?.message || "Erreur inconnue",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
