import { useState, useEffect } from "react";

export default function UserAccount() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const stored = localStorage.getItem("pocketbase_auth");
      if (!stored) return handleLogout("Aucun token trouvé");

      let auth;
      try {
        auth = JSON.parse(stored);
      } catch (err) {
        return handleLogout("Token invalide : " + err.message);
      }

      const userId = auth?.record?.id;
      if (!userId) return handleLogout("Identifiant manquant");

      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Erreur API :", data.error);
        } else {
          setUserData(data);
        }
      } catch (err) {
        console.error("Erreur fetch /api/user :", err);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = (msg) => {
    console.warn("Déconnexion forcée :", msg);
    setLoading(false);
  };

  if (loading) return <p className="text-white">Chargement...</p>;

  if (!userData) {
    return (
      <div className="text-white">
        <h1>User Account</h1>
        <p>Non connecté</p>
        <a href="/login">Connectez-vous</a>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col justify-center items-center gap-4">
      <h1>User Account</h1>
      <h1>
        {userData?.prenom} {userData?.lastName}
      </h1>
    </div>
  );
}

function Section({ title, items, userData }) {
  return (
    <div>
      <h2>{title}</h2>
      <ul className="flex justify-start gap-2 flex-wrap w-full">
        {items.map((item) => (
          <li className="bg-white text-black rounded-full px-2 py-1" key={item}>
            {item}
          </li>
        ))}
      </ul>
      <button
        onClick={() => console.log("UserData complet :", userData)}
        className="mt-2 text-xs text-white underline"
      >
        Debug userData
      </button>
    </div>
  );
}
