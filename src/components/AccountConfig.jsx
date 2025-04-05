import React, { useState, useEffect, useCallback } from "react";
import gradientCircle from "../assets/gradient_circle.webp";

const steps = [
  `Bienvenue sur BeeUs\u00A0!`,
  "Quels types d'activités t'intéressent ?",
  "Quand es-tu le plus disponible ?",
  "Quel budget es-tu prêt(e) à mettre pour une sortie ?",
  "Quelques informations pour configurer ton profil !",
];

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    categories: [],
    times: [],
    budget: [],
    nom: "",
    prenom: "",
    ville: "",
    etudes: "",
    naissance: "",
    genre: "",
  });
  const [communes, setCommunes] = useState([]);
  const [filteredCommunes, setFilteredCommunes] = useState([]);
  const [options, setOptions] = useState({
    activites: [],
    disponibilites: [],
    budget: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [activites, disponibilites, budget] = await Promise.all([
          fetch("/api/types/activites").then((res) => res.json()),
          fetch("/api/types/disponibilites").then((res) => res.json()),
          fetch("/api/types/budget").then((res) => res.json()),
        ]);
        setOptions({ activites, disponibilites, budget });
      } catch (error) {
        console.error("❌ Erreur lors du chargement des options :", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (step !== 4 || communes.length > 0) return;
    const fetchCommunes = async () => {
      try {
        const res = await fetch(
          "https://geo.api.gouv.fr/communes?fields=nom&format=json&geometry=centre"
        );
        const data = await res.json();
        const villes = Array.from(new Set(data.map((c) => c.nom)));
        villes.sort((a, b) =>
          a.localeCompare(b, "fr", { sensitivity: "base" })
        );
        setCommunes(villes);
        setFilteredCommunes(villes.slice(0, 50));
      } catch (error) {
        console.error("❌ Erreur lors du chargement des communes :", error);
      }
    };
    fetchCommunes();
  }, [step]);

  useEffect(() => {
    const filtered = communes.filter((v) =>
      v.toLowerCase().includes(formData.ville.toLowerCase())
    );
    setFilteredCommunes(filtered.slice(0, 50));
  }, [formData.ville, communes]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleSelect = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }, []);

  const handleNext = useCallback(async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    try {
      const stored = localStorage.getItem("pocketbase_auth");
      const auth = stored && JSON.parse(stored);
      const userId = auth?.record?.id;
      if (!userId) throw new Error("Utilisateur non connecté");

      const payload = {
        userId,
        data: {
          prenom: formData.prenom,
          nom: formData.nom,
          activites: formData.categories,
          disponibilites: formData.times,
          budget: formData.budget,
          ville: formData.ville,
          etudes: formData.etudes,
          naissance: formData.naissance,
          genre: formData.genre,
        },
      };

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      window.location.href = "/account";
    } catch (error) {
      console.error("❌ Erreur lors de la soumission :", error);
    }
  }, [step, formData]);

  const handleBack = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <div className="relative flex flex-col items-center p-6 text-white w-full max-w-lg mx-auto min-h-[90dvh] z-10">
      {step === 0 && (
        <>
          <div className="fixed inset-0 z-[-1] pointer-events-none">
            <img
              src={gradientCircle?.src || gradientCircle}
              alt="Background gradient"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
              style={{
                width: "50%",
                height: "50%",
                maxWidth: "none",
                maxHeight: "none",
              }}
            />
          </div>
          <div className="flex flex-col items-center justify-center text-center flex-grow">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{steps[0]}</h1>
              <p className="text-lg px-4">
                Faisons connaissance pour t'aider à trouver les meilleures
                sorties et activités près de chez toi.
              </p>
            </div>
          </div>
        </>
      )}

      {step > 0 && step < 4 && (
        <h2 className="text-2xl font-bold mb-4">{steps[step]}</h2>
      )}

      {step === 1 && (
        <CheckboxGroup
          items={options.activites}
          selected={formData.categories}
          onToggle={(v) => toggleSelect("categories", v)}
        />
      )}

      {step === 2 && (
        <CheckboxGroup
          items={options.disponibilites}
          selected={formData.times}
          onToggle={(v) => toggleSelect("times", v)}
        />
      )}

      {step === 3 && (
        <CheckboxGroup
          items={options.budget}
          selected={formData.budget}
          onToggle={(v) => toggleSelect("budget", v)}
        />
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4 w-full z-10">
          {[
            ["Prénom", "prenom"],
            ["Nom", "nom"],
            ["Ville", "ville"],
            ["Études", "etudes"],
            ["Date de naissance", "naissance"],
            ["Genre", "genre"],
          ].map(([label, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={key} className="text-sm font-medium text-white">
                {label}
              </label>
              {key === "ville" ? (
                <input
                  list="commune-list"
                  id={key}
                  className="border border-zinc-100 px-4 py-2 rounded-md text-white bg-black"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Quelle est ta ville ?"
                />
              ) : key === "genre" ? (
                <select
                  id={key}
                  className="border border-zinc-100 px-4 py-2 rounded-md text-white bg-black"
                  value={formData.genre}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
              ) : (
                <input
                  id={key}
                  type={key === "naissance" ? "date" : "text"}
                  placeholder={label}
                  className="border border-zinc-100 px-4 py-2 rounded-md text-white bg-black"
                  value={formData[key]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <datalist id="commune-list">
            {filteredCommunes.map((nomVille) => (
              <option key={nomVille} value={nomVille} />
            ))}
          </datalist>
        </div>
      )}

      <div className="w-full mt-6 flex flex-col gap-4">
        {step === 0 ? (
          <>
            <button
              onClick={() => setStep(1)}
              className="bg-[var(--color-violet)] px-4 py-2 rounded-xl w-full text-sm"
            >
              Personnaliser mes recommandations
            </button>
            <button
              onClick={() => setStep(4)}
              className="border border-[var(--color-violet)] px-4 py-2 rounded-xl w-full text-sm"
            >
              Passer
            </button>
          </>
        ) : (
          <div className="flex gap-4">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="bg-[var(--color-light-violet)] text-black px-4 py-2 rounded w-full"
              >
                Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-[var(--color-violet)] px-8 py-2 rounded w-full"
            >
              {step < steps.length - 1 ? "Suivant" : "Terminer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const CheckboxGroup = React.memo(function CheckboxGroup({
  items,
  selected,
  onToggle,
}) {
  if (!items?.length) return <p>Chargement...</p>;
  return (
    <div className="flex flex-col gap-4 w-full">
      {items.map((item) => (
        <label
          key={item}
          className="text-sm flex items-center gap-6 border border-zinc-100 px-6 py-4 rounded-md justify-between w-full"
        >
          {item}
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
            className="accent-[var(--color-violet)] w-6 h-6"
          />
        </label>
      ))}
    </div>
  );
});
