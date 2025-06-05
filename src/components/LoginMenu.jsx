import { useState, useEffect } from "react";

export default function LoginMenu() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.href.includes("error1")
    ) {
      setErr("Email ou mot de passe invalide.");
    }
  }, []);

  async function login() {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("❌ La réponse n'était pas un JSON valide :", jsonErr);
        throw new Error("La réponse du serveur est invalide.");
      }

      if (!res.ok) {
        console.error("❌ Échec de connexion :", data?.error);
        window.location.href = "/login?error1";
        return;
      }

      localStorage.setItem(
        "pocketbase_auth",
        JSON.stringify({
          token: data.token,
          record: data.record,
        })
      );

      window.location.href = "/account";
    } catch (err) {
      console.error("Erreur login :", err);
      window.location.href = "/login?error1";
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        login();
      }}
      className="flex flex-col items-center gap-8 w-full font-body"
    >
      <div className="flex flex-col gap-5 w-full max-w-xl bg-white/5 p-8 md:p-10 rounded-2xl shadow-lg">
        {err && <p className="text-(--color-yellow) font-semibold">{err}</p>}

        <input
          type="email"
          placeholder="Adresse e-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-(--color-blue) text-white placeholder:text-white/70"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-(--color-blue) text-white placeholder:text-white/70"
        />
      </div>

      <div className="flex flex-col items-center w-full max-w-xl gap-3 px-4">
        <button
          type="submit"
          className="rounded-xl px-6 py-3 w-full font-medium text-white text-base bg-(--color-violet) hover:opacity-90 transition-opacity"
        >
          Se connecter
        </button>
        <a
          href="/register"
          className="text-sm text-white/70 hover:text-white underline"
        >
          Pas encore de compte ? Inscrivez-vous !
        </a>
      </div>
    </form>
  );
}
