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

  const handleCheckboxChange = (id) => {
    setCategoryChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(categoryChecked);
    }
  }, [categoryChecked, onSelectionChange]);

  return (
    <div className="flex flex-col mt-8 gap-4">
      {error && <p className="text-red-500">{error}</p>}
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex flex-col items-end rounded-2xl w-full"
        >
          <div
            onClick={() => toggleCategory(category.categorie)}
            className="w-full px-4 py-2 flex items-center justify-between cursor-pointer rounded-sm text-white border border-white"
          >
            <span>{category.categorie}</span>
            <span>{openCategory === category.categorie ? "▲" : "▼"}</span>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden w-full ${
              openCategory === category.categorie
                ? "opacity-100 max-h-[500px]"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-2 mt-2 py-1 pl-12 lg:pl-16">
              {(category.expand?.sous_categorie || []).map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => handleCheckboxChange(sc.id)}
                  className="flex items-center justify-between w-full h-fit border border-white px-4 py-2 text-white rounded-sm cursor-pointer"
                >
                  <span>{sc.sous_categorie}</span>
                  <input
                    type="checkbox"
                    name="categoryChecked"
                    checked={categoryChecked.includes(sc.id)}
                    onChange={() => handleCheckboxChange(sc.id)}
                    onClick={(e) => e.stopPropagation()}
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
