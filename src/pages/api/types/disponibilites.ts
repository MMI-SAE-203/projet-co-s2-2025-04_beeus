import type { APIRoute } from "astro";
import { getDisponibilitesTypes } from "../../../lib/pocketbase.mjs";

export const GET: APIRoute = async () => {
  const data = await getDisponibilitesTypes();
  return new Response(JSON.stringify(data));
};
