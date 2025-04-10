import PocketBase, {
  BaseAuthStore,
} from "/node_modules/pocketbase/dist/pocketbase.es.js";

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
      passwordConfirm: password,
      prenom: username,
    });
    return { success: true, data: newUser };
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription PocketBase :", error);
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
    console.error(
      "❌ Erreur lors de la récupération des utilisateurs :",
      error
    );
    return { success: false, error: error.message || error };
  }
}

export async function getOneUser(userId) {
  await superAuth();
  let record = await adminPb.collection("users").getOne(userId);
  record.avatar = pb.files.getURL(record, record.avatar);
  return record;
}

export async function getUserPosts() {
  await superAuth();
  const posts = await adminPb.collection("evenement").getFullList();
  return posts.filter(
    (post) =>
      Array.isArray(post.createurs) &&
      post.createurs.includes(pb.authStore.record.id)
  );
}

export async function getUserFavoritePlace() {
  await superAuth();
  const posts = await adminPb.collection("lieux").getFullList();
  return posts.filter(
    (post) =>
      Array.isArray(post.favoris) &&
      post.favoris.includes(pb.authStore.record.id)
  );
}

export async function getUserNextEvent() {
  await superAuth();
  const posts = await adminPb.collection("evenement").getFullList();
  const userId = pb.authStore.record.id;
  const today = new Date();
  return posts.filter(
    (post) =>
      Array.isArray(post.participants) &&
      post.participants.includes(userId) &&
      new Date(post.date_heure) >= today
  );
}

export async function transformImg(tab) {
  await superAuth();
  tab.avatar = pb.files.getURL(tab, tab.avatar);
  return tab;
}

export async function getEventCategories() {
  await superAuth();
  return await adminPb.collection("categories_evenement").getFullList();
}
export async function getLocationCategories() {
  await superAuth();
  return await adminPb.collection("categories_lieu").getFullList();
}

export async function createEvent(data) {
  await superAuth();
  return await adminPb.collection("evenement").create({
    ...data,
  });
}

export async function fetchAllActivitiesFromPB() {
  await superAuth();

  try {
    const [lieux, evenements] = await Promise.all([
      adminPb
        .collection("lieux")
        .getFullList()
        .catch((err) => {
          console.warn(
            "⚠️ Impossible de récupérer la collection 'lieux' :",
            err.message
          );
          return [];
        }),

      adminPb
        .collection("evenement")
        .getFullList()
        .catch((err) => {
          console.warn(
            "⚠️ Impossible de récupérer la collection 'evenement' :",
            err.message
          );
          return [];
        }),
    ]);

    const typedLieux = lieux.map((item) => ({ ...item, type: "place" }));
    const typedEvenements = evenements.map((item) => ({
      ...item,
      type: "event",
    }));
    const combinedResults = [...typedLieux, ...typedEvenements];

    return combinedResults;
  } catch (error) {
    console.error(
      "❌ Erreur PocketBase lors de fetchAllActivitiesFromPB :",
      error
    );
    return [];
  }
}
