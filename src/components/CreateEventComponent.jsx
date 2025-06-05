import { useState, useCallback, useMemo, memo } from "react";
import SearchMap from "./SearchMap";
import EventCategories from "./EventCategories";
import DateInput from "./DateInput";

const MemoizedSearchMap = memo(SearchMap);
const MemoizedEventCategories = memo(EventCategories);
const MemoizedDateInput = memo(DateInput);

export default function CreateEvent() {
  const [selectedplace, setSelectedplace] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [titre, setTitre] = useState("");
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(0);
  const [customMaxParticipants, setCustomMaxParticipants] = useState(52);
  const [description, setDescription] = useState("");

  const effectiveMaxParticipants = useMemo(() => {
    if (maxParticipants === 0) return "Illimité";
    return maxParticipants === 50 ? customMaxParticipants : maxParticipants;
  }, [maxParticipants, customMaxParticipants]);

  const handleplaceSelect = useCallback((place) => {
    setSelectedplace(place);
  }, []);

  const handleCategoriesChange = useCallback((categories) => {
    setSelectedCategories(categories);
  }, []);

  const handleTitreChange = useCallback((e) => {
    setTitre(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const handleMaxParticipantsChange = useCallback((e) => {
    const value = Number(e.target.value);
    setMaxParticipants(value);
    if (value < 50) {
      setCustomMaxParticipants(value);
    }
  }, []);

  const handleCustomMaxParticipantsChange = useCallback((e) => {
    setCustomMaxParticipants(Number(e.target.value));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (
      !selectedplace ||
      selectedCategories.length === 0 ||
      !titre.trim() ||
      !date
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    const payload = {
      place: selectedplace,
      categories: selectedCategories,
      titre,
      date_heure: date,
      participants_max:
        maxParticipants === 50 ? customMaxParticipants : maxParticipants,
      description,
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
      window.location.href = `/events/${result.slug}`;
    } catch (err) {
      console.error("❌ Erreur lors de la création :", err);
      setError(err.message);
    }
  }, [
    selectedplace,
    selectedCategories,
    titre,
    date,
    maxParticipants,
    customMaxParticipants,
    description,
  ]);

  const showCustomInput = maxParticipants === 50;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4 md:px-8 lg:px-32 mt-8 md:mt-12 mb-16">
      <MemoizedSearchMap onPlaceSelect={handleplaceSelect} />

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Entrez le titre de l'événement"
          name="titreInput"
          value={titre}
          onChange={handleTitreChange}
          className="border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-sm sm:text-base"
        />

        <MemoizedDateInput date={date} setDate={setDate} />

        <div className="space-y-2">
          <label
            htmlFor="maxParticipants"
            className="block font-medium text-sm sm:text-base"
          >
            Nombre maximum de participants : {effectiveMaxParticipants}
          </label>

          <input
            id="maxParticipants"
            type="range"
            min="0"
            max="50"
            value={maxParticipants}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
            onChange={handleMaxParticipantsChange}
          />

          {showCustomInput && (
            <div className="space-y-1 mt-2">
              <label
                htmlFor="customMaxParticipants"
                className="block text-xs sm:text-sm text-gray-700"
              >
                Nombre personnalisé (au-delà de 50) :
              </label>
              <input
                id="customMaxParticipants"
                type="number"
                min="51"
                value={customMaxParticipants}
                onChange={handleCustomMaxParticipantsChange}
                placeholder="Entrez un nombre supérieur à 50"
                className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              />
            </div>
          )}
        </div>

        <MemoizedEventCategories onCategoriesChange={handleCategoriesChange} />

        <textarea
          placeholder="Décris ton événement en quelques mots pour donner envie aux autres de te rejoindre !"
          className="w-full p-2 min-h-24 sm:min-h-32 md:min-h-48 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
          value={description}
          onChange={handleDescriptionChange}
        />

        {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}

        <button
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm sm:text-base font-medium transition-colors duration-200"
          onClick={handleSubmit}
        >
          Créer l'événement
        </button>
      </div>
    </div>
  );
}
