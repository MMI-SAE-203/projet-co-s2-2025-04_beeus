export async function formatAdresse(adresse) {
  const parts = adresse.split(",").map((p) => p.trim());
  const result = [];
  if (parts[0]) result.push(parts[0]);
  if (parts[0]?.includes("Axone") && parts[1] && parts[2]) {
    result.push(parts[1]);
    result.push(parts[2]);
  } else if (
    parts[1] &&
    (parts[1].includes("Rue") || parts[1].includes("Route"))
  ) {
    result.push(parts[1]);
  }
  let cityFound = false;
  const mainCities = ["Montbéliard", "Andelnans", "Belfort", "Courbevoie"];
  for (const part of parts) {
    for (const city of mainCities) {
      if (part === city || part.includes(city)) {
        result.push(city);
        cityFound = true;
        break;
      }
    }
    if (cityFound && part.includes("La Défense")) {
      result.push("La Défense 5");
      break;
    }
    if (cityFound && !part.includes("La Défense")) break;
  }
  for (const part of parts) {
    if (/^\d{5}$/.test(part)) {
      result.push(part);
      break;
    }
  }
  return result.join(", ");
}
