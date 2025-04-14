import { useEffect, useState } from "react";
import SearchMap from "./SearchMap";
import PlaceCategories from "./PlaceCategories";
import SetStarNotation from "./SetStarNotation.jsx";

export default function CreatePlace() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [titre, setTitre] = useState("");
  const [error, setError] = useState(null);
  const [description, setDescription] = useState("");
  const [notation, setNotation] = useState(0);

  const handleSubmit = async () => {
    setError(null);

    console.log("📤 Categories envoyés dans le payload :", selectedCategories);

    if (!selectedLocation || !titre.trim()) {
      setError(
        "Veuillez remplir le nom du lieu et sélectionner un emplacement."
      );
      return;
    }

    console.log(notation);

    const payload = {
      location: selectedLocation,
      categories: selectedCategories,
      titre,
      description,
      notation,
    };

    console.log("📝 Données du formulaire :", payload);

    try {
      const res = await fetch("/api/create-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la création du lieu.");
      }

      const result = await res.json();
      window.location.href = `/places/${result.slug}`;
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
        placeholder="Nom du lieu"
        name="titreInput"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="border p-2 rounded"
      />
      <SetStarNotation onChange={setNotation} />

      <PlaceCategories onSelectionChange={setSelectedCategories} />

      <div>
        <textarea
          placeholder="Décris ce lieu pour donner envie aux autres de le découvrir !"
          className="w-full p-2 min-h-48 border border-gray-300 rounded-md resize-none"
          name="descriptionInput"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        onClick={handleSubmit}
      >
        Enregistrer le lieu
      </button>
    </div>
  );
}
