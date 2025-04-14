import React, { useEffect, useState, useMemo } from "react";
import starFull from "../icons/starFULL.png";
import starHalf from "../icons/starHalf.png";
import starEmpty from "../icons/starEmpty.png";

const StarRating = ({ lieuId, max = 5, size = 24, className = "" }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lieuId) return;

    const fetchRating = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/get-notations?id=${lieuId}`);
        const data = await res.json();

        if (typeof data.note === "number") {
          setNote(data.note);
        } else {
          console.warn("🟡 Note invalide depuis l'API :", data);
          setNote(0);
        }
      } catch (err) {
        console.error("❌ Erreur fetch notation :", err);
        setNote(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [lieuId]);

  const stars = useMemo(() => {
    if (note === null) return [];

    return Array.from({ length: max }).map((_, i) => {
      const starSrc =
        note >= i + 1
          ? starFull.src
          : note >= i + 0.5
          ? starHalf.src
          : starEmpty.src;

      return (
        <img
          key={i}
          src={starSrc}
          alt={`${i + 1} star`}
          width={size}
          height={size}
        />
      );
    });
  }, [note, max, size]);

  if (!lieuId) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        Aucun <code>lieuId</code> fourni.
      </div>
    );
  }

  if (loading || note === null) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-1 items-center ${className}`}>
      {stars}
      <span className="ml-2 text-sm text-gray-500">{note} / 5</span>
    </div>
  );
};

export default React.memo(StarRating);
