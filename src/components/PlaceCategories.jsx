import { useEffect, useState } from "react";

export default function Categoriesplace({ onSelectionChange }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [categoryChecked, setCategoryChecked] = useState([]);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await fetch("/api/place-category");
        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(
          "❌ Erreur lors de la récupération des catégories :",
          err
        );
        setError("Erreur lors de la récupération des catégories.");
      }
    }
    getCategories();
  }, []);

  const toggleCategory = (categorieName) => {
    setOpenCategory((prev) => (prev === categorieName ? null : categorieName));
  };

  const handleCheckboxChange = (item) => {
    setCategoryChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Pour vérification, log dans le composant lui-même
  useEffect(() => {
    console.log("Catégories cochées :", categoryChecked);
  }, [categoryChecked]);

  // Vous pouvez toujours appeler un callback s'il est défini,
  // mais en mode client:only, la fonction passée depuis Astro ne sera pas transmise.
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(categoryChecked);
    }
  }, [categoryChecked, onSelectionChange]);

  return (
    <div className="flex flex-col mt-8 items-center gap-4 rounded-3xl px-4">
      {error && <p className="text-red-500">{error}</p>}
      {categories.map((category) => (
        <div
          key={category.categorie}
          className="flex flex-col items-end rounded-2xl min-w-[90dvw] w-full"
        >
          <div
            onClick={() => toggleCategory(category.categorie)}
            className="w-full h-8 px-4 flex items-center justify-between cursor-pointer rounded-sm text-white border border-white"
          >
            <span>{category.categorie}</span>
            <span>{openCategory === category.categorie ? "▲" : "▼"}</span>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden w-3/4 ${
              openCategory === category.categorie
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-2 mt-2">
              {category.sous_categorie.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between w-full h-fit border border-white px-4 py-2 text-white rounded-sm"
                >
                  {item}
                  <input
                    type="checkbox"
                    name="categoryChecked"
                    checked={categoryChecked.includes(item)}
                    onChange={() => handleCheckboxChange(item)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
