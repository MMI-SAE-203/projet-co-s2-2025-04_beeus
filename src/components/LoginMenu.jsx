import { useState, useEffect } from "react";

export default function LoginMenu() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.href.includes("error1")) {
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
      className="flex flex-col items-center gap-12"
    >
      <div className="flex flex-col items-center gap-6 bg-white py-8 px-4 rounded-3xl min-w-[90dvw]">
        {err && <h2 className="text-red-600 self-start px-8">{err}</h2>}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 w-full rounded-none border-b border-(--color-blue) focus:outline-(--color-blue) focus:rounded-lg ease-in-out transition-all duration-300 focus:text-zinc-950 placeholder:text-zinc-950 text-zinc-950"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 w-full rounded-none border-b border-(--color-blue) focus:outline-(--color-blue) focus:rounded-lg ease-in-out transition-all duration-300 focus:text-zinc-950 placeholder:text-zinc-950 text-zinc-950"
        />
      </div>

      <div className="flex flex-col items-center w-full gap-4">
        <button
          type="submit"
          className="bg-(--color-violet) text-white font-medium rounded-full px-6 py-2 w-full"
        >
          Se connecter
        </button>
        <a href="/register" className="text-white self-start font-light text-sm">
          Pas encore de compte ? Inscrivez-vous !
        </a>
      </div>
    </form>
  );
}
