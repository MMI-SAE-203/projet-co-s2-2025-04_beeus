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
  const [initialComment, setInitialComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [commentId, setCommentId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const debounceTimeout = useRef(null);

  const fetchExisting = useCallback(async () => {
    if (!userId || !lieuId) return;

    try {
      const record = await getExistingPlaceComment(lieuId, userId);

      if (record) {
        setNote(record.note);
        setInitialComment(record.commentaire || "");
        setIsEditing(true);
        setCommentId(record.id);
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
      setInitialComment(commentaire || "");
      setRawComment("");
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
      setInitialComment("");
      setIsEditing(false);
      setCommentId(null);

      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto relative">
      <h2 className="text-xl font-bold mb-4 text-center">
        {isEditing ? "Modifier votre avis" : "Laisser un avis"}
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
          placeholder={
            isEditing && !rawComment ? initialComment : "Exprimez votre avis..."
          }
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
          : isEditing && rawComment.trim()
          ? "Modifier mon commentaire"
          : "Envoyer mon avis"}
      </button>

      {showConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full bg-zinc-950/40 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded shadow-xl text-center max-w-xs w-full">
            <p className="text-sm text-black mb-4">
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
