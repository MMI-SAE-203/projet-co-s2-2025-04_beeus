import { createPortal } from "react-dom";
import { useEffect, useState, useCallback, memo } from "react";

const SharePortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

const ShareMenu = memo(({ slug, placeId, onClose }) => {
  const shareUrl = `https://beeus.bryan-menoux.fr/places/${slug}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      await fetch("/api/place-interactions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          share: true,
        }),
      });
    } catch (err) {
      console.error("Erreur lors de la copie :", err);
    } finally {
      onClose();
    }
  }, [shareUrl, placeId, onClose]);

  const handleShare = async (platformUrl) => {
    try {
      window.open(platformUrl, "_blank", "noopener,noreferrer");

      await fetch("/api/place-interactions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          share: true,
        }),
      });
    } catch (err) {
      console.error("Erreur lors du partage :", err);
    } finally {
      onClose();
    }
  };

  return (
    <SharePortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <div
          className="w-[24rem] max-w-[90vw] p-6 bg-white rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4 overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="text-2xl font-semibold text-zinc-900">
            Partager ce lieu
          </h1>
          <p className="text-sm text-zinc-600">
            Partagez ce lieu avec vos amis !
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2 w-full">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
            >
              Copier le lien
            </button>

            <button
              onClick={() =>
                handleShare(`https://twitter.com/intent/tweet?url=${shareUrl}`)
              }
              className="px-4 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 transition"
            >
              Twitter
            </button>

            <button
              onClick={() =>
                handleShare(
                  `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
                )
              }
              className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition"
            >
              Facebook
            </button>

            <button
              onClick={() =>
                handleShare(
                  `https://wa.me/?text=Regarde ce lieu sur BeeUs : ${shareUrl}`
                )
              }
              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
            >
              WhatsApp
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:underline mt-2"
          >
            Fermer
          </button>
        </div>
      </div>
    </SharePortal>
  );
});

ShareMenu.displayName = "ShareMenu";
export default ShareMenu;
