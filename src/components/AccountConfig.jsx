import { useState, useEffect } from "react";

const steps = ["Quels types d'activités t'intéressent ?", "Quand es-tu le plus disponible ?", "Quel budget es-tu prêt(e) à mettre pour une sortie ?"];

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    categories: [],
    times: [],
    budget: [],
  });

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
      } catch (err) {
        console.error("❌ Erreur lors du chargement des options :", err);
      }
    };

    fetchOptions();
  }, []);

  const toggleSelect = (field, value) => {
    setFormData((prev) => {
      const alreadySelected = prev[field].includes(value);
      const updated = alreadySelected
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value];
      return { ...prev, [field]: updated };
    });
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    try {
      const stored = localStorage.getItem("pocketbase_auth");
      const auth = JSON.parse(stored);
      const userId = auth?.record?.id;

      if (!userId) throw new Error("Utilisateur non connecté");

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          data: {
            activites: formData.categories,
            disponibilites: formData.times,
            budget: formData.budget,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      window.location.href = "/account";
    } catch (err) {
      console.error("❌ Erreur lors de la soumission :", err);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="max-w-lg mx-auto p-6 text-white pt-20">
      <h2 className="text-2xl font-bold mb-4">
        {steps[step]}
      </h2>

      {step === 0 && (
        <CheckboxGroup
          items={options.activites}
          selected={formData.categories}
          onToggle={(v) => toggleSelect("categories", v)}
        />
      )}
      {step === 1 && (
        <CheckboxGroup
          items={options.disponibilites}
          selected={formData.times}
          onToggle={(v) => toggleSelect("times", v)}
        />
      )}
      {step === 2 && (
        <CheckboxGroup
          items={options.budget}
          selected={formData.budget}
          onToggle={(v) => toggleSelect("budget", v)}
        />
      )}

      <div className={step <= 0 ? "flex justify-end mt-6" : "flex justify-between mt-6"}>
        {step > 0 && (
          <button onClick={handleBack} className="bg-gray-600 px-4 py-2 rounded">
            Précédent
          </button>
        )}
        <button onClick={handleNext} className="bg-(--color-violet) px-8 py-2 rounded">
          {step < steps.length - 1 ? "Suivant" : "Terminer"}
        </button>
      </div>
    </div>
  );
}

function CheckboxGroup({ items, selected, onToggle }) {
  if (!items?.length) return <p>Chargement...</p>;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <label key={item} className="text-sm flex items-center gap-6 border border-zinc-100 px-6 py-4 rounded-md justify-between">
          {item}
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
            className="accent-(--color-violet) text-[15dvh] w-[4dvw] h-[4dvw]"
          />
        </label>
      ))}
    </div>
  );
}
