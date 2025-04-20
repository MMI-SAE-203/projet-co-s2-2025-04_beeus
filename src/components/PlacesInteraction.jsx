import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import notLikedIcon from "../icons/notLiked.svg";
import likedIcon from "../icons/like.svg";
import notSavedIcon from "../icons/notSaved.svg";
import savedIcon from "../icons/save.svg";
import notSharedIcon from "../icons/notShared.svg";
import sharedIcon from "../icons/share.svg";

import ShareMenu from "./ShareMenu";

const INTERACTION_TYPES = { LIKE: "like", SAVE: "save", SHARE: "share" };

const ActionButton = memo(({ icon, alt, onClick }) => (
  <button
    onClick={onClick}
    className="p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
    aria-label={alt}
  >
    <motion.img
      src={icon}
      alt={alt}
      className="w-6 h-6"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    />
  </button>
));

ActionButton.displayName = "ActionButton";

const PlacesInteraction = ({ placeId, slug, like = false, save = false }) => {
  const [interactions, setInteractions] = useState({
    [INTERACTION_TYPES.LIKE]: Boolean(like),
    [INTERACTION_TYPES.SAVE]: Boolean(save),
    [INTERACTION_TYPES.SHARE]: false,
  });

  useEffect(() => {
    setInteractions((prev) => ({
      ...prev,
      [INTERACTION_TYPES.LIKE]: Boolean(like),
      [INTERACTION_TYPES.SAVE]: Boolean(save),
    }));
  }, [like, save, placeId]);

  useEffect(() => {
    const isPageLoad = sessionStorage.getItem(`p-${placeId}`) !== "1";

    if (isPageLoad && placeId) {
      sessionStorage.setItem(`p-${placeId}`, "1");
      setInteractions((prev) => ({
        ...prev,
        [INTERACTION_TYPES.SHARE]: false,
      }));
    }

    return () => placeId && sessionStorage.removeItem(`p-${placeId}`);
  }, [placeId]);
  const updateServer = useCallback(
    async (newState, type) => {
      if (!placeId || type === INTERACTION_TYPES.SHARE) return;

      const body = {
        placeId,
        [type]: newState,
      };

      try {
        console.log("→ Envoi au serveur :", body);

        const response = await fetch("/api/place-interactions", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}`);
      } catch (err) {
        console.error("Erreur de mise à jour:", err);
        setInteractions((prev) => ({
          ...prev,
          [INTERACTION_TYPES.LIKE]: Boolean(like),
          [INTERACTION_TYPES.SAVE]: Boolean(save),
        }));
      }
    },
    [placeId, like, save]
  );

  const toggle = useCallback(
    (type) => {
      setInteractions((prev) => {
        const newState = !prev[type];
        updateServer(newState, type);
        return { ...prev, [type]: newState };
      });
    },
    [updateServer]
  );

  const interactionConfig = {
    [INTERACTION_TYPES.LIKE]: {
      icon: interactions[INTERACTION_TYPES.LIKE]
        ? likedIcon.src
        : notLikedIcon.src,
      alt: "J'aime",
    },
    [INTERACTION_TYPES.SAVE]: {
      icon: interactions[INTERACTION_TYPES.SAVE]
        ? savedIcon.src
        : notSavedIcon.src,
      alt: "Sauvegarder",
    },
    [INTERACTION_TYPES.SHARE]: {
      icon: interactions[INTERACTION_TYPES.SHARE]
        ? sharedIcon.src
        : notSharedIcon.src,
      alt: "Partager",
    },
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {Object.entries(interactionConfig).map(([type, { icon, alt }]) => (
          <ActionButton
            key={type}
            icon={icon}
            alt={alt}
            onClick={() => toggle(type)}
          />
        ))}
      </div>

      <AnimatePresence>
        {interactions[INTERACTION_TYPES.SHARE] && (
          <ShareMenu
            slug={slug}
            placeId={placeId}
            onClose={() => toggle(INTERACTION_TYPES.SHARE)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(PlacesInteraction);
