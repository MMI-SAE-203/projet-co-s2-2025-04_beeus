import { useEffect, useState } from "react";

export default function CategoriesLocation() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [openCategory, setOpenCategory] = useState(null); // 👈 pour gérer l'ouverture

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await fetch("/api/location-category");

        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }

        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(
          "❌ Une erreur s'est produite lors de la récupération des catégories :",
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

  return (
    <div className="flex flex-col items-center gap-8 py-8 px-4 rounded-3xl min-w-[90dvw]">
      {error && <p className="text-red-500">{error}</p>}

      {categories.map((category) => (
        <div
          key={category.categorie}
          className="flex flex-col items-end py-4 px-4 rounded-2xl min-w-[90dvw]"
        >
          <div
            onClick={() => toggleCategory(category.categorie)}
            className="w-full h-8 px-4 flex items-center justify-between cursor-pointer text-white border border-white"
          >
            <span>{category.categorie}</span>
            <span>{openCategory === category.categorie ? "▲" : "▼"}</span>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden w-2/3 ${
              openCategory === category.categorie
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-2">
              {category.sous_categorie.map((item) => (
                <div
                  key={item}
                  className="w-full border border-white h-6 px-4 flex items-center text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
