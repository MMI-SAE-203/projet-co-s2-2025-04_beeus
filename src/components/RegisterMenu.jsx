import { useState, useEffect } from "react";

export default function RegisterMenu() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

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
      className="flex flex-col items-center gap-12"
    >
      <div className="flex flex-col items-center gap-6 bg-white py-8 px-4 rounded-3xl min-w-[90dvw]">
        {err && <h2 className="text-red-600 self-start px-8">{err}</h2>}

        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 w-full rounded-none border-b border-(--color-blue) focus:outline-(--color-blue) focus:rounded-lg ease-in-out transition-all duration-300 focus:text-zinc-950 placeholder:text-zinc-950 text-zinc-950"
        />

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
          placeholder="Password"
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
          Register
        </button>
        <a href="/login" className="text-white self-start font-light text-sm">
          Vous avez un compte ? Connectez-vous !
        </a>
      </div>
    </form>
  );
}
