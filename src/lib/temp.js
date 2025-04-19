import PocketBase from "pocketbase";

const pb = new PocketBase("https://pb-beeus.bryan-menoux.fr:443");

export async function fetchAllSousCategoriesLieu() {
  try {
    const records = await pb.collection("sous_categories_lieu").getFullList();
    return records;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des sous-catégories :",
      error
    );
    return [];
  }
}

// ⚠️ Appelle cette fonction dans un IIFE si tu veux l'utiliser en dehors d’un module top-level
const sousCategories = await fetchAllSousCategoriesLieu();
sousCategories.forEach((element) => {
  console.log(element.sous_categorie);
});
