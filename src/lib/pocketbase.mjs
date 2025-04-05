import PocketBase, { BaseAuthStore } from "pocketbase";

export const pb = new PocketBase("https://pb-beeus.bryan-menoux.fr:443");
pb.autoCancellation(false);

export const adminPb = new PocketBase(
  "https://pb-beeus.bryan-menoux.fr:443",
  new BaseAuthStore()
);
adminPb.autoCancellation(false);

export async function superAuth() {
  const adminEmail = "admin@admin.com";
  const adminPass = "s1V0i5P0sp0HZkv";

  return await adminPb
    .collection("_superusers")
    .authWithPassword(adminEmail, adminPass);
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
  console.log(email, password, username);
  try {
    const newUser = await adminPb.collection("users").create({
      email: email,
      password: password,
      passwordConfirm: password, // ← est-ce que ce champ est obligatoire dans PocketBase ?
      prenom: username,
    });
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Erreur register pocketbase.mjs :", error);
    return { success: false, error };
  }
}

export async function getActivitesTypes() {
  await superAuth();
  const usersCollection = await adminPb.collections.getOne("users");
  const activites = usersCollection.fields.find((f) => f.name === "activites");
  return activites?.values || [];
}

export async function getDisponibilitesTypes() {
  await superAuth();
  const usersCollection = await adminPb.collections.getOne("users");
  const field = usersCollection.fields.find((f) => f.name === "disponibilites");
  return field?.values || [];
}

export async function getBudgetTypes() {
  await superAuth();
  const usersCollection = await adminPb.collections.getOne("users");
  const field = usersCollection.fields.find((f) => f.name === "budget");
  return field?.values || [];
}

export async function updateUser(userId, data) {
  await superAuth();
  return await adminPb.collection("users").update(userId, data);
}

export async function getUsers() {
  await superAuth();
  try {
    const records = await adminPb
      .collection("users")
      .getFullList({ sort: "-created" });
    return { success: true, data: records };
  } catch (error) {
    console.error("❌ Erreur PocketBase getUsers :", error);
    return { success: false, error: error.message || error };
  }
}

export async function getOneUser(userId) {
  await superAuth();
  let record = await adminPb.collection("users").getOne(userId);
  record.avatar = pb.files.getURL(record, record.avatar);
  return record;
}

export async function temp() {
  await superAuth();
  return await adminPb.collection("temp").getFullList();
}

export async function transformImg(tab) {
  await superAuth();
  tab.avatar = pb.files.getURL(tab, tab.avatar);
  return tab; // Retourne le résultat modifié
}

export async function getPosts() {
  await superAuth();
  return "yes";
}

export async function getLocationCategories() {
  await superAuth();
  return await adminPb.collection("categories_lieu").getFullList();
}
