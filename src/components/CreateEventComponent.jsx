import { useState } from "react";
import SearchMap from "./SearchMap";
import EventCategories from "./EventCategories";
import DateInput from "./DateInput";

export default function CreateEvent() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [titre, setTitre] = useState("");
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(0);
  const [customMaxParticipants, setCustomMaxParticipants] = useState(52);

  const handleSubmit = async () => {
    setError(null);

    if (
      !selectedLocation ||
      selectedCategories.length === 0 ||
      !titre.trim() ||
      !date
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    console.log("📤 Date envoyée dans le payload :", date); // DEBUG

    const descriptionInput = document.querySelector(
      'textarea[name="descriptionInput"]'
    ).value;

    const payload = {
      location: selectedLocation,
      categories: selectedCategories,
      titre,
      date_heure: date,
      participants_max: maxParticipants,
      description: descriptionInput,
    };

    try {
      const res = await fetch("/api/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error || "Erreur lors de la création de l'événement."
        );
      }

      const result = await res.json();
      console.log("✅ Événement créé :", result);
    } catch (err) {
      console.error("❌ Erreur lors de la création :", err);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 mt-12">
      <SearchMap onLocationSelect={setSelectedLocation} />

      <input
        type="text"
        placeholder="Entrez le titre de l'événement"
        name="titreInput"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="border p-2 rounded"
      />

      <DateInput date={date} setDate={setDate} />

      <div className="space-y-2">
        <label htmlFor="maxParticipants" className="block font-medium">
          Nombre maximum de participants :{" "}
          {maxParticipants === 0
            ? "Illimité"
            : maxParticipants === 51 && customMaxParticipants > 51
            ? customMaxParticipants
            : maxParticipants}
        </label>

        <input
          id="maxParticipants"
          type="range"
          min="0"
          max="50"
          value={maxParticipants}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
          onChange={(e) => {
            const value = Number(e.target.value);
            setMaxParticipants(value);
            if (value < 50) {
              setCustomMaxParticipants(value); // reset si retour dans la plage
            }
          }}
        />

        {maxParticipants === 50 && (
          <div className="space-y-1">
            <label
              htmlFor="customMaxParticipants"
              className="block text-sm text-gray-700"
            >
              Nombre personnalisé (au-delà de 50) :
            </label>
            <input
              id="customMaxParticipants"
              type="number"
              min="51"
              value={customMaxParticipants}
              onChange={(e) => setCustomMaxParticipants(Number(e.target.value))}
              placeholder="Entrez un nombre supérieur à 50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      <EventCategories onCategoriesChange={setSelectedCategories} />

      <div>
        <textarea
          placeholder="Décris ton événement en quelques mots pour donner envie aux autres de te rejoindre !"
          className="w-full p-2 min-h-48 border border-gray-300 rounded-md resize-none"
          name="descriptionInput"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={handleSubmit}
      >
        Créer l'événement
      </button>
    </div>
  );
}
