import React, { useState, useEffect, useRef, useCallback } from "react";
import SetStarNotation from "../components/SetStarNotation.jsx";
import {
  getExistingPlaceComment,
  saveOrUpdatePlaceComment,
  deletePlaceComment,
} from "../lib/pocketbase.mjs";

export default function CreatePlaceComment({ lieuId, userId }) {
  const [note, setNote] = useState(0);
  const [rawComment, setRawComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [commentId, setCommentId] = useState(null);
  const [hasPostedOnce, setHasPostedOnce] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const debounceTimeout = useRef(null);

  const fetchExisting = useCallback(async () => {
    if (!userId || !lieuId) return;

    try {
      const record = await getExistingPlaceComment(lieuId, userId);

      if (record) {
        setNote(record.note);
        setRawComment(record.commentaire || ""); // préremplit le champ texte
        setIsEditing(true); // passe directement en mode édition
        setCommentId(record.id);
        setHasPostedOnce(true);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du commentaire:", err);
    }
  }, [userId, lieuId]);

  useEffect(() => {
    fetchExisting();

    const handleEdit = (e) => {
      const { note, commentaire, id } = e.detail;
      setNote(note);
      setRawComment(commentaire || "");
      setIsEditing(true);
      setCommentId(id);
    };

    const handleDelete = (e) => {
      const { id } = e.detail;
      if (!id) return;
      setCommentId(id);
      setShowConfirmation(true);
    };

    window.addEventListener("edit-comment", handleEdit);
    window.addEventListener("delete-comment", handleDelete);

    return () => {
      window.removeEventListener("edit-comment", handleEdit);
      window.removeEventListener("delete-comment", handleDelete);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [fetchExisting]);

  const confirmDelete = async () => {
    if (!commentId) return;
    try {
      setIsSubmitting(true);
      const deleted = await deletePlaceComment(commentId);

      if (deleted) {
        setSuccessMessage("Commentaire supprimé avec succès");
        setNote(0);
        setRawComment("");
        setIsEditing(false);
        setCommentId(null);
        setHasPostedOnce(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleNoteChange = (value) => {
    setNote(value);
  };

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setRawComment(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
  };

  const handleSubmit = async () => {
    if (!lieuId || note === 0) return;

    const finalComment = rawComment.trim();

    if (!userId) {
      console.warn("Aucun userId transmis pour commenter");
      return;
    }

    if (hasPostedOnce && !isEditing) {
      console.warn("Un commentaire existe déjà. Passez par l'édition.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        lieu: lieuId,
        user: userId,
        note,
        commentaire: finalComment,
      };

      await saveOrUpdatePlaceComment(data, isEditing ? commentId : null);

      setSuccessMessage(
        isEditing ? "Votre avis a été mis à jour" : "Avis ajouté avec succès"
      );

      setNote(0);
      setRawComment("");
      setIsEditing(false);
      setCommentId(null);
      setHasPostedOnce(true);

      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {hasPostedOnce ? "Ajouter un nouvel avis" : "Laisser un avis"}
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Note attribuée :
        </label>
        <SetStarNotation
          initialRating={note}
          onChange={handleNoteChange}
          size={24}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Votre commentaire :
        </label>
        <textarea
          onChange={handleTextareaChange}
          value={rawComment}
          disabled={isSubmitting}
          className="w-full h-32 p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          placeholder="Exprimez votre avis..."
        ></textarea>
      </div>

      {successMessage && (
        <p className="text-sm text-green-500 mb-4 text-center">
          {successMessage}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full sm:w-auto px-4 py-2 rounded transition text-white ${
          isSubmitting
            ? "bg-gray-400 cursor-wait"
            : "bg-violet-600 hover:bg-violet-700"
        }`}
      >
        {isSubmitting
          ? "Envoi en cours..."
          : isEditing
          ? "Mettre à jour mon avis"
          : hasPostedOnce
          ? "Modifier mon commentaire"
          : "Envoyer mon avis"}
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded shadow-md max-w-[400px] w-full">
            <p className="mb-4 text-center">
              Confirmez-vous la suppression de ce commentaire ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
