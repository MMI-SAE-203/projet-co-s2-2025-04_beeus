import type { APIRoute } from "astro";
import { getActivitesTypes } from "../../../lib/pocketbase.mjs";

export const GET: APIRoute = async () => {
  const data = await getActivitesTypes();
  return new Response(JSON.stringify(data));
};
