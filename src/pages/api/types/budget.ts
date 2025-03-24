import type { APIRoute } from "astro";
import { getBudgetTypes } from "../../../lib/pocketbase.mjs";

export const GET: APIRoute = async () => {
  const data = await getBudgetTypes();
  return new Response(JSON.stringify(data));
};
