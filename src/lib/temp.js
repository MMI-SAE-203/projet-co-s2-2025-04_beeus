import PocketBase from "pocketbase";

const pb = new PocketBase("https://pb-beeus.bryan-menoux.fr:443");

async function run() {
  await pb.admins.authWithPassword("admin@admin.com", "s1V0i5P0sp0HZkv");

  const escape = (str) => str.replace(/"/g, '\\"').trim();

  const data = {
    "Soirée & Fête": [
      "Soirée étudiante",
      "Soirée à thème",
      "Apéro / Dégustation",
      "Soirée privée",
      "Soirée intégration",
    ],
    "Bar & Chill": [
      "Bar à jeux",
      "Bar à cocktails",
      "Pub / Brasserie",
      "Rooftop / Terrasse",
      "Happy Hour entre potes",
    ],
    "Culture & Spectacle": [
      "Concert live",
      "Théâtre ou spectacle vivant",
      "Projection étudiante",
      "Exposition ou vernissage",
      "Scène libre / Micro ouvert",
    ],
    "Gaming & E-sport": [
      "Tournoi jeux vidéo",
      "Soirée Mario Kart / FIFA",
      "LAN party",
      "Escape Game",
      "Blind test / Quiz",
    ],
    "Sport & Activité physique": [
      "Tournoi sportif",
      "Yoga / stretching",
      "Patinoire / Piscine / Bowling",
      "Course chill ou rando",
      "Découverte sport insolite",
    ],
    "Études & Révisions": [
      "Révisions collectives",
      "Groupes de TD",
      "Semaine d’exam",
      "Atelier méthodo",
      "Talk étudiant / invité·e",
    ],
    Outdoor: [
      "Pique-nique collectif",
      "Sortie parc ou jardin",
      "Chill au bord du lac",
      "Guitare / musique dehors",
      "Chasse au trésor urbaine",
    ],
    Shopping: [
      "Vide-dressing étudiant",
      "Marché solidaire",
      "Friperie éphémère",
      "Troc étudiant",
      "DIY mode",
    ],
    Créatif: [
      "Atelier créatif",
      "Atelier cuisine",
      "Upcycling / déco",
      "Tatouage / nail art",
      "Podcast / fanzine / journal",
    ],
    Autre: [
      "Rencontre inter-campus",
      "Découverte de lieu",
      "Événement associatif",
      "Soirée surprise",
      "À définir ensemble",
    ],
  };

  for (const [categorie, sousCats] of Object.entries(data)) {
    try {
      const sousCategorieIds = [];

      for (const label of sousCats) {
        // 🔍 Vérifie si la sous-catégorie existe, sinon la crée
        let sous = await pb
          .collection("sous_categories_evenement")
          .getFirstListItem(`sous_categorie = "${escape(label)}"`)
          .catch(() => null);

        if (!sous) {
          sous = await pb.collection("sous_categories_evenement").create({
            sous_categorie: label,
          });
          console.log(`✅ Sous-catégorie créée : ${label}`);
        } else {
          console.log(`⚠️ Sous-catégorie existante : ${label}`);
        }

        sousCategorieIds.push(sous.id);
      }

      if (sousCategorieIds.length === 0) {
        console.warn(
          `❌ Aucune sous-catégorie pour : ${categorie} — catégorie ignorée`
        );
        continue;
      }

      const existingCat = await pb
        .collection("categories_evenement")
        .getFirstListItem(`categorie = "${escape(categorie)}"`)
        .catch(() => null);

      if (existingCat) {
        console.log(`⚠️ Catégorie déjà existante : ${categorie}`);
        continue;
      }

      const created = await pb.collection("categories_evenement").create({
        categorie,
        sous_categorie: sousCategorieIds,
      });

      console.log(
        `✅ Catégorie créée : ${categorie} → ${sousCategorieIds.length} sous-catégories liées`
      );
    } catch (err) {
      console.error(`❌ Erreur pour "${categorie}" :`, err.message);
    }
  }

  console.log("🎉 Catégories et sous-catégories événement : terminé !");
}

run();
