import { useState } from "react";

export default function FavoritePlaceButton({
  initialFavorite,
  userId,
  placeId,
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/toggle-place-favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, placeId }),
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du favori", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`rounded-lg px-2 py-1 md:px-4 md:py-2 flex items-center gap-2 transition-colors duration-200  ${
        isFavorite
          ? "bg-(--color-violet) text-white text-xs"
          : "border-1 border-(--color-violet) text-xs"
      }`}
    >
      <svg
        viewBox="-1 -1 32 28"
        className="w-5 h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 7.21036V9.26036C29.83 9.64036 29.78 10.0604 29.65 10.4604C28.03 15.4904 21.64 21.0004 17.48 24.1404C17.19 24.3604 15.17 25.8704 15.01 25.8604C13.75 25.0604 12.53 24.1804 11.35 23.2604C7.37 20.1904 1.32 14.8504 0.199997 9.79036C0.139997 9.50036 0.16 9.16036 0 8.91036V8.56035C0.1 8.35035 0.1 7.94035 0 7.74036V7.51036C0.16 6.89036 0.190001 6.24036 0.360001 5.61036C1.33 1.83036 4.56 -0.0296429 8.34 0.000357128C11.01 0.0203571 13.41 1.24036 15.01 3.36036C15.12 3.38036 15.44 2.88036 15.53 2.78036C19.31 -1.30964 25.92 -0.819645 28.82 3.99036C29.43 5.00035 29.74 6.08036 30 7.22036V7.21036Z"
          className={
            isFavorite
              ? "fill-(--color-yellow)"
              : "stroke-2 stroke-(--color-violet)"
          }
        ></path>
      </svg>
      Enregistrer le lieu
    </button>
  );
}
