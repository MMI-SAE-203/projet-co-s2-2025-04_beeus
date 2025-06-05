import PocketBase, {
  BaseAuthStore,
} from "/node_modules/pocketbase/dist/pocketbase.es.js";
// import PocketBase, { BaseAuthStore } from "pocketbase";
import { structures } from "./structures.js";

export const pb = new PocketBase("https://pb-beeus.bryan-menoux.fr:443");

pb.autoCancellation(false);

export const adminPb = new PocketBase(
  "https://pb-beeus.bryan-menoux.fr:443",
  new BaseAuthStore()
);
adminPb.autoCancellation(false);

const ADMIN_CREDENTIALS = {
  email: "admin@admin.com",
  password: "s1V0i5P0sp0HZkv",
};

export async function superAuth() {
  return adminPb
    .collection("_superusers")
    .authWithPassword(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
}

export async function login(email, password) {
  await superAuth();
  try {
    const authData = await adminPb
      .collection("users")
      .authWithPassword(email, password);
    return { success: true, data: authData };
  } catch (error) {
    return { success: false, error };
  }
}

export async function register(email, password, username) {
  await superAuth();
  try {
    const newUser = await adminPb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      prenom: username,
    });
    return { success: true, data: newUser };
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription PocketBase :", error);
    return { success: false, error };
  }
}

export async function getUsers() {
  await superAuth();
  try {
    const users = await adminPb
      .collection("users")
      .getFullList({ sort: "-created" });
    return { success: true, data: users };
  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs :", error);
    return { success: false, error: error.message || error };
  }
}

export async function getOneUser(userId) {
  await superAuth();
  const record = await adminPb.collection("users").getOne(userId);
  record.avatar = pb.files.getURL(record, record.avatar);
  return record;
}

export async function updateUser(userId, data) {
  await superAuth();
  return adminPb.collection("users").update(userId, data);
}

export async function transformImg(user) {
  await superAuth();
  user.avatar = pb.files.getURL(user, user.avatar);
  return user;
}

async function getFieldValues(fieldName) {
  await superAuth();
  const usersCollection = await adminPb.collections.getOne("users");
  const field = usersCollection.fields.find((f) => f.name === fieldName);
  return field?.values || [];
}

export const getActivitesTypes = () => getFieldValues("activites");
export const getDisponibilitesTypes = () => getFieldValues("disponibilites");
export const getBudgetTypes = () => getFieldValues("budget");

export async function createEvent(formData) {
  await superAuth();
  const nom = formData.get("nom");
  if (!nom) {
    console.error("❌ Erreur: le champ 'nom' est manquant ou invalide.");
    throw new Error("Le champ 'nom' est obligatoire pour créer un événement.");
  }
  const baseSlug = generateSlug(nom.toString());
  let slug = baseSlug;
  let count = 1;
  console.log("🔍 Vérification du slug dans PocketBase...");
  while (true) {
    try {
      await adminPb
        .collection("evenement")
        .getFirstListItem(`slug = "${slug}"`);
      console.log(
        `❌ Slug '${slug}' déjà existant, tentative avec un nouveau...`
      );
      slug = `${baseSlug}-${count++}`;
    } catch (error) {
      console.log(`✅ Slug unique trouvé : ${slug}`);
      break;
    }
  }
  formData.append("slug", slug);
  console.log("📦 [API] FormData créé :", formData);
  const result = await adminPb.collection("evenement").create(formData);
  console.log("🎉 [API] Événement créé avec succès :", result);
  return result;
}

export async function getEventCategories() {
  await superAuth();
  return adminPb
    .collection("categories_evenement")
    .getFullList({ expand: "sous_categorie" });
}

export async function getLocationCategories() {
  await superAuth();
  return adminPb
    .collection("categories_lieu")
    .getFullList({ expand: "sous_categorie" });
}

export async function getAllPlaceCategories() {
  await superAuth();
  const records = await adminPb
    .collection("categories_lieu")
    .getFullList({ expand: "sous_categorie" });
  return records;
}

export async function fetchAllActivitiesFromPB() {
  await superAuth();
  try {
    const [lieux, evenements] = await Promise.all([
      adminPb
        .collection("lieux")
        .getFullList()
        .catch(() => []),
      adminPb
        .collection("evenement")
        .getFullList()
        .catch(() => []),
    ]);

    return [
      ...lieux.map((l) => ({ ...l, type: "place" })),
      ...evenements.map((e) => ({ ...e, type: "event" })),
    ];
  } catch (error) {
    console.error("❌ Erreur fetchAllActivitiesFromPB :", error);
    return [];
  }
}

async function getCurrentUserId() {
  await superAuth();
  const authStore = pb.authStore;
  if (!authStore.isValid) {
    console.error("❌ Auth store is not valid");
    return null;
  }
  const userId = authStore.model.id;
  return userId;
}

export async function getUserPosts(userId) {
  if (!userId) return [];
  await superAuth();

  return await adminPb.collection("evenement").getFullList({
    filter: `createur = "${userId}"`,
    sort: "-created",
  });
}

export async function getUserFavoritePlace(userId) {
  await superAuth();

  const lieux = await adminPb.collection("interactions_lieu").getFullList({
    expand: "user, lieu",
    filter: `user = "${userId}" && save = true`,
  });
  return lieux;
}

export async function isUserFavoritePlace(userId, placeId) {
  await superAuth();
  let record = await adminPb
    .collection("lieux")
    .getFullList({ filter: `favoris.id ?= "${userId}" && id = "${placeId}"` });
  return record;
}

export async function updateUserFavoritePlace(userId, placeId) {
  await superAuth();
  const record = await adminPb.collection("lieux").getOne(placeId);
  if (!record) return null;
  const favoris = record.favoris || [];
  if (favoris.includes(userId)) {
    favoris.splice(favoris.indexOf(userId), 1);
  } else {
    favoris.push(userId);
  }
  await adminPb.collection("lieux").update(placeId, { favoris });
  return favoris;
}

export async function getUserNextEvents(userId) {
  await superAuth();
  const now = new Date().toISOString();
  const events = await adminPb.collection("evenement").getFullList({
    expand: "participants",
    filter: `participants.id ?= "${userId}" && date_heure > "${now}"`,
    sort: "-date_heure",
  });
  return events.map(formatPostDate);
}

export async function formatPostDate(post) {
  return {
    ...post,
    date_heure: new Date(post.date_heure).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    }),
  };
}

export async function getOneNotation(id) {
  try {
    await superAuth();
    const notes = await adminPb.collection("notation_lieux").getFullList({
      filter: `lieu = "${id}"`,
    });

    const valid = notes.filter((n) => typeof n.note === "number");
    const total = valid.reduce((sum, n) => sum + n.note, 0);
    return valid.length ? Math.round((total / valid.length) * 2) / 2 : 0;
  } catch (error) {
    console.error("❌ Erreur récupération notation :", error);
    return null;
  }
}

export async function createNotation(data) {
  await superAuth();
  return adminPb.collection("notation_lieux").create({
    ...data,
  });
}

export function generateSlug(nom) {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function convertToWebP(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const webp = new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
          type: "image/webp",
        });
        resolve(webp);
      },
      "image/webp",
      0.8
    );
  });
}

export async function createPlace(formData) {
  await superAuth();

  const nom = formData.get("nom");
  const baseSlug = generateSlug(nom.toString());
  let slug = baseSlug;
  let count = 1;

  while (true) {
    try {
      await adminPb.collection("lieux").getFirstListItem(`slug = "${slug}"`);
      slug = `${baseSlug}-${count++}`;
    } catch {
      break;
    }
  }

  formData.append("slug", slug);

  return adminPb.collection("lieux").create(formData);
}

export async function getPlaceIdBySlug(slug) {
  await superAuth();
  try {
    const lieu = await adminPb
      .collection("lieux")
      .getFirstListItem(`slug = "${slug}"`, {
        expand: "createur,categories",
      });

    if (lieu.images && Array.isArray(lieu.images)) {
      lieu.imagesUrls = lieu.images
        .filter((image) => image && image.trim() !== "")
        .map((image) => adminPb.files.getURL(lieu, image));
    } else {
      lieu.imagesUrls = [];
    }
    return lieu;
  } catch (err) {
    console.error("❌ Lieu introuvable pour le slug :", slug);
    return null;
  }
}

export function isEtudiantEmail(email) {
  if (typeof email !== "string") return false;

  const domain = email.split("@")[1];
  const knownDomains = Object.values(structures);

  return knownDomains.includes(domain);
}

export async function addToNewsletter(data) {
  try {
    const existing = await adminPb
      .collection("newsletter")
      .getFirstListItem(`email = "${data.email}"`)
      .catch(() => null);
    if (existing) {
      return { success: false, reason: "exists" };
    }
    await adminPb.collection("newsletter").create(data);
    return { success: true };
  } catch (err) {
    console.error("❌ Erreur addToNewsletter :", err);
    return { success: false };
  }
}
export async function getAllPlaces() {
  await superAuth();

  try {
    const places = await adminPb
      .collection("lieux")
      .getFullList({ expand: "createur" });

    return places.map((place) => {
      const processedPlace = { ...place };

      processedPlace.imagesUrls = Array.isArray(place.images)
        ? place.images
            .filter((img) => img?.trim())
            .map((img) => adminPb.files.getURL(place, img))
        : [];

      const creator = place.expand?.createur;
      processedPlace.creatorAvatar = creator?.avatar
        ? adminPb.files.getURL(creator, creator.avatar)
        : null;

      return processedPlace;
    });
  } catch (error) {
    console.error("❌ Erreur récupération lieux :", error);
    return [];
  }
}

export async function updatePlaceInteractions({
  userId,
  placeId,
  like,
  save,
  share,
}) {
  await superAuth();

  const filter = `user = "${userId}" && lieu = "${placeId}"`;

  let existingRecord;
  try {
    const records = await adminPb
      .collection("interactions_lieu")
      .getFullList(1, { filter });

    existingRecord = records?.[0];
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de l'interaction :",
      error
    );
    throw error;
  }

  const payload = {
    ...(like !== undefined && { like }),
    ...(save !== undefined && { save }),
    ...(share !== undefined && { share }),
  };

  let result;
  try {
    if (existingRecord) {
      result = await adminPb
        .collection("interactions_lieu")
        .update(existingRecord.id, payload);
    } else {
      result = await adminPb.collection("interactions_lieu").create({
        user: userId,
        lieu: placeId,
        ...payload,
      });
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création ou mise à jour de l'interaction :",
      error
    );
    throw error;
  }

  return result;
}

export async function getAllPlacesForUser(userId) {
  await superAuth();
  try {
    const notations = await adminPb
      .collection("interactions_lieu")
      .getFullList({
        expand: "user",
        filter: `user ?= "${userId}"`,
      });
    return notations;
  } catch (error) {
    console.error("❌ Erreur récupération lieux :", error);
    return [];
  }
}

export async function getPlaceNotation(lieuId) {
  await superAuth();

  try {
    const records = await adminPb
      .collection("notation_lieux")
      .getFullList({ filter: `lieu = "${lieuId}"`, expand: "user" });

    records.forEach((record) => {
      const user = record.expand?.user;
      if (user && user.avatar) {
        user.avatar = pb.files.getURL(user, user.avatar);
      }
    });

    return records;
  } catch (error) {
    console.error("❌ Erreur récupération commentaires :", error);
    return null;
  }
}

export async function getExistingPlaceComment(lieuId, userId) {
  await superAuth();

  if (!userId || !lieuId) return null;

  try {
    const record = await adminPb
      .collection("notation_lieux")
      .getFirstListItem(`lieu="${lieuId}" && user="${userId}"`, {
        $autoCancel: false,
      });

    return record;
  } catch (err) {
    if (err.status !== 404) {
      console.error("Erreur lors de la récupération du commentaire:", err);
    }
    return null;
  }
}

export async function saveOrUpdatePlaceComment(data, commentId = null) {
  await superAuth();

  if (commentId) {
    return adminPb.collection("notation_lieux").update(commentId, data);
  } else {
    return adminPb.collection("notation_lieux").create(data);
  }
}

export async function deletePlaceComment(commentId) {
  await superAuth();

  if (!commentId) return false;

  try {
    await adminPb.collection("notation_lieux").delete(commentId);
    return true;
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
    return false;
  }
}

export async function getAllEvents() {
  await superAuth();
  try {
    const events = await adminPb
      .collection("evenement")
      .getFullList({ expand: "createur" });
    return events;
  } catch (error) {
    console.error("❌ Erreur récupération événements :", error);
    return [];
  }
}

export async function getAllEventsForUser(userId) {
  await superAuth();
  try {
    const events = await adminPb.collection("evenement").getFullList({
      expand: "createur",
      filter: `createur = "${userId}"`,
    });
    return events;
  } catch (error) {
    console.error("❌ Erreur récupération événements :", error);
    return [];
  }
}

export async function getCategoryName(category) {
  await superAuth();
  try {
    const categoryData = await adminPb
      .collection("sous_categories_evenement")
      .getOne(category);
    return categoryData.sous_categorie;
  } catch (error) {
    console.error("❌ Erreur récupération catégorie :", error);
    return null;
  }
}
