import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import notLikedIcon from "../icons/notLiked.svg";
import likedIcon from "../icons/like.svg";
import notSavedIcon from "../icons/notSaved.svg";
import savedIcon from "../icons/save.svg";
import notSharedIcon from "../icons/notShared.svg";
import sharedIcon from "../icons/share.svg";

export default function PlacesInteraction({
  placeId,
  like = false,
  save = false,
  share = false,
}) {
  const [interactions, setInteractions] = useState({
    like: Boolean(like),
    save: Boolean(save),
    share: Boolean(share),
  });

  useEffect(() => {
    setInteractions({
      like: Boolean(like),
      save: Boolean(save),
      share: Boolean(share),
    });
  }, [like, save, share, placeId]);

  const updateServer = async (newInteractions) => {
    if (!placeId) return;

    try {
      const response = await fetch("/api/place-interactions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          ...newInteractions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
    } catch (e) {
      console.error("Erreur lors de la mise à jour des interactions:", e);

      setInteractions({
        like: Boolean(like),
        save: Boolean(save),
        share: Boolean(share),
      });
    }
  };

  const toggle = (type) => {
    setInteractions((prev) => {
      const next = { ...prev, [type]: !prev[type] };
      updateServer(next);
      return next;
    });
  };

  const iconMap = {
    like: {
      src: interactions.like ? likedIcon.src : notLikedIcon.src,
      alt: "J'aime",
    },
    save: {
      src: interactions.save ? savedIcon.src : notSavedIcon.src,
      alt: "Sauvegarder",
    },
    share: {
      src: interactions.share ? sharedIcon.src : notSharedIcon.src,
      alt: "Partager",
    },
  };

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(iconMap).map(([type, { src, alt }]) => (
        <button key={type} onClick={() => toggle(type)} className="p-3">
          <motion.img
            src={src}
            alt={alt}
            className="w-6 h-6"
            layout
            whileTap={{ scale: 0.9 }}
          />
        </button>
      ))}
    </div>
  );
}
