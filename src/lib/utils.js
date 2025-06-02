export function formatAdresse(adresse) {
  if (!adresse || typeof adresse !== "object") return "";

  const {
    number = "",
    street = "",
    locality = "",
    county = "",
    postcode = "",
  } = adresse;

  const departementNumber = postcode ? postcode.substring(0, 2) : "";

  const line1 = [number, street].filter(Boolean).join(" ").trim();
  const line2 = [locality, departementNumber, county]
    .filter(Boolean)
    .join(", ")
    .trim();

  if (!line1 && !line2) return "";

  return [line1, line2].filter(Boolean).join(", ");
}

export async function formatDateFr(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
