import type { APIRoute } from "astro";
import { adminPb } from "../../lib/pocketbase.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { note, comment, lieuId, userId } = body;

    const noteNum = Number(note);

    if (
      isNaN(noteNum) ||
      typeof comment !== "string" ||
      typeof lieuId !== "string" ||
      typeof userId !== "string" ||
      comment.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ error: "Paramètres invalides ou manquants." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existing = await adminPb
      .collection("notation_lieux")
      .getFirstListItem(`lieu="${lieuId}" && user="${userId}"`)
      .catch(() => null);

    if (existing) {
      const updated = await adminPb
        .collection("notation_lieux")
        .update(existing.id, {
          note: noteNum,
          commentaire: comment.trim(),
        });

      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const created = await adminPb.collection("notation_lieux").create({
      note: noteNum,
      commentaire: comment.trim(),
      lieu: lieuId,
      user: userId,
    });

    return new Response(JSON.stringify(created), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Erreur dans /api/set-comment :", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID du commentaire manquant." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await adminPb.collection("notation_lieux").delete(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Erreur DELETE /api/set-comment :", err);
    return new Response(JSON.stringify({ error: "Erreur serveur." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
