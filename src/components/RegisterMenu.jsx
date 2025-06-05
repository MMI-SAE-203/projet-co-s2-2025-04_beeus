import { useState, useEffect } from "react";
import { structures } from "../lib/structures";

export default function RegisterMenu() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.href.includes("error1")
    ) {
      setErr("Email ou mot de passe invalide");
    }
  }, []);

  async function register() {
    const domain = email.split("@")[1];

    if (Object.values(structures).includes(domain)) {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          window.location.href = "/register?error1";
          return;
        }

        const loginRes = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem(
            "pocketbase_auth",
            JSON.stringify({
              token: loginData.token,
              record: loginData.record,
            })
          );
          window.location.href = "/account-configuration";
        } else {
          window.location.href = "/register?error1";
        }
      } catch (error) {
        console.error("Erreur register :", error);
        window.location.href = "/register?error1";
      }
    } else {
      setErr("Seules les adresses mails étudiantes sont acceptées.");
      setTimeout(() => setErr(""), 3000);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        register();
      }}
      className="flex flex-col items-center gap-8 w-full font-body"
    >
      <div className="flex flex-col gap-5 w-full max-w-xl bg-white/5 p-8 md:p-10 rounded-2xl shadow-lg">
        {err && (
          <>
            <p className="text-(--color-yellow) font-semibold">{err}</p>
            <a
              href="/contact"
              className="text-sm underline text-(--color-blue) hover:opacity-80"
            >
              Votre email étudiant ne fonctionne pas ? Contactez-nous.
            </a>
          </>
        )}

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

        <label className="flex items-start gap-3 text-sm text-white leading-snug">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="accent-(--color-violet) mt-1 w-4 h-4"
            required
          />
          <span>
            J'accepte les{" "}
            <a
              href="/legal-notices-&-CGU"
              className="text-white underline hover:opacity-80"
            >
              Conditions Générales d’Utilisation
            </a>{" "}
            et la{" "}
            <a
              href="/confidentialite"
              className="text-white underline hover:opacity-80"
            >
              Politique de confidentialité
            </a>
            .
          </span>
        </label>
      </div>

      <div className="flex flex-col items-center w-full max-w-xl gap-3 px-4">
        <button
          type="submit"
          className={`rounded-xl px-6 py-3 w-full font-medium text-white text-base transition-colors ${
            accepted
              ? "bg-(--color-violet) hover:opacity-90"
              : "bg-zinc-600 cursor-not-allowed"
          }`}
        >
          S'inscrire
        </button>
        <a
          href="/login"
          className="text-sm text-white/70 hover:text-white underline"
        >
          Vous avez un compte ? Connectez-vous !
        </a>
      </div>
    </form>
  );
}
