import { useState, useEffect } from "react";

export default function RegisterMenu() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.href.includes("error1")) {
      setErr("Email ou mot de passe invalide");
    }
  }, []);

  async function register() {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

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
    } catch (err) {
      console.error("Erreur register :", err);
      window.location.href = "/register?error1";
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        register();
      }}
      className="flex flex-col items-center gap-8"
    >
      <div className="flex flex-col items-center gap-6 bg-white py-6 px-4 rounded-3xl min-w-[90dvw]">
        {err && <h2 className="text-red-600 self-start px-6">{err}</h2>}

        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 w-full rounded-none border-b border-(--color-blue) focus:outline-(--color-blue) focus:rounded-lg rounded-t-lg ease-in-out transition-all duration-300 focus:text-zinc-950 placeholder:text-zinc-950 text-zinc-950"
        />

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 w-full rounded-none border-b border-(--color-blue) focus:outline-(--color-blue) focus:rounded-lg rounded-t-lg ease-in-out transition-all duration-300 focus:text-zinc-950 placeholder:text-zinc-950 text-zinc-950"
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 w-full rounded-none border-b border-(--color-blue) focus:outline-(--color-blue) focus:rounded-lg rounded-t-lg ease-in-out transition-all duration-300 focus:text-zinc-950 placeholder:text-zinc-950 text-zinc-950"
        />
         <label className="flex gap-2 items-center text-sm text-black">
  <input
    type="checkbox"
    checked={accepted}
    onChange={(e) => setAccepted(e.target.checked)}
    className="w-5 h-5 accent-(--color-violet)"
    required
  />
  <span>
    J'accepte les{" "}
    <a
      href="/cgu"
      className="underline lg:no-underline lg:hover:underline text-(--color-violet)"
    >
      Conditions Générales d’Utilisation
    </a>{" "}
    et la{" "}
    <a
      href="/confidentialite"
      className="underline lg:no-underline lg:hover:underline text-(--color-violet)"
    >
      Politique de confidentialité
    </a>.
  </span>
</label>




      </div>

      <div className="flex flex-col items-center w-full gap-2">
        <button
          type="submit"
          className={`${accepted ? "bg-(--color-violet) text-white" : "bg-zinc-600"} font-medium rounded-full px-6 py-2 w-full`}
        >
          S'inscrire
        </button>
        <a href="/login" className="text-white self-start font-light text-sm px-2">
          Vous avez un compte ? Connectez-vous !
        </a>
      </div>
    </form>
  );
}
