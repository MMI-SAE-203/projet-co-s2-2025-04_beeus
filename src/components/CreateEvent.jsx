import { useState } from "react";
import SearchMap from "./SearchMap";
import EventCategories from "./EventCategories";

export default function CreateEvent() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [titre, setTitre] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: selectedLocation,
          categories: selectedCategories,
          titre,
        }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      //   window.location.href = `/evenement/${result.id}`;
    } catch (error) {
      console.error(error);
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
      />
      <EventCategories onCategoriesChange={setSelectedCategories} />
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={handleSubmit}
      >
        Créer l'événement
      </button>
    </div>
  );
}
