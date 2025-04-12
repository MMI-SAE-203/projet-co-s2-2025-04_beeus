import { useEffect, useState } from "react";

export default function CategoriesEvents({ onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [categoryChecked, setCategoryChecked] = useState([]);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await fetch("/api/event-category");
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("❌ Erreur récupération catégories :", err);
        setError("Erreur lors de la récupération des catégories.");
      }
    }
    getCategories();
  }, []);

  useEffect(() => {
    if (onCategoriesChange) {
      onCategoriesChange(categoryChecked);
    }
  }, [categoryChecked, onCategoriesChange]);

  const toggleCategory = (categorieName) => {
    setOpenCategory((prev) => (prev === categorieName ? null : categorieName));
  };

  const handleCheckboxChange = (itemId) => {
    setCategoryChecked((prev) => {
      const updated = prev.includes(itemId)
        ? prev.filter((i) => i !== itemId)
        : [...prev, itemId];
      return updated;
    });
  };

  return (
    <div className="flex flex-col mt-8 items-center gap-2 rounded-3xl">
      {error && <p className="text-red-500">{error}</p>}
      {categories.map((category) => (
        <div
          key={category.id}
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
              {category.expand?.sous_categorie?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between w-full h-fit border border-white px-4 py-1 text-white rounded-sm"
                >
                  <label htmlFor={`souscat-${item.id}`}>
                    {item.sous_categorie}
                  </label>
                  <input
                    id={`souscat-${item.id}`}
                    type="checkbox"
                    checked={categoryChecked.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
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
