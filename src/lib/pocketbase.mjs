import PocketBase, { BaseAuthStore } from "pocketbase";

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

export async function createEvent(data) {
  await superAuth();
  return adminPb.collection("evenement").create(data);
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

function getCurrentUserId() {
  return pb.authStore?.record?.id || null;
}

export async function getUserPosts() {
  await superAuth();
  const userId = getCurrentUserId();
  if (!userId) return [];

  const posts = await adminPb
    .collection("evenement")
    .getFullList({ sort: "-created" });
  return posts.filter((p) => p.createur === userId).map(formatPostDate);
}

export async function getUserFavoritePlace() {
  await superAuth();
  const userId = getCurrentUserId();
  if (!userId) return [];

  const lieux = await adminPb.collection("lieux").getFullList();
  return lieux.filter(
    (l) => Array.isArray(l.favoris) && l.favoris.includes(userId)
  );
}

export async function getUserNextEvents() {
  await superAuth();
  const userId = getCurrentUserId();
  if (!userId) return [];

  const now = new Date().toISOString();
  const events = await adminPb.collection("evenement").getFullList({
    filter: `participants.id ?= "${userId}" && date_heure > "${now}"`,
    sort: "-date_heure",
  });

  return events.map(formatPostDate);
}

function formatPostDate(post) {
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

export async function createPlace(data) {
  await superAuth();

  const baseSlug = generateSlug(data.nom);
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

  return adminPb.collection("lieux").create({
    ...data,
    slug,
  });
}

export async function getLieuIdBySlug(slug) {
  await superAuth();
  try {
    const lieu = await adminPb
      .collection("lieux")
      .getFirstListItem(`slug = "${slug}"`);
    return lieu;
  } catch (err) {
    console.error("❌ Lieu introuvable pour le slug :", slug);
    return null;
  }
}
