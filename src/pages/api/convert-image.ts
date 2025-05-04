import type { APIRoute } from "astro";
import sharp from "sharp";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file || !file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Fichier image invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Convertir en WebP
    const outputBuffer = await sharp(inputBuffer)
      .webp({ quality: 80 }) // tu peux ajuster ici
      .toBuffer();

    return new Response(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Content-Disposition": `inline; filename="converted.webp"`,
      },
    });
  } catch (err) {
    console.error("❌ Erreur de conversion :", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
