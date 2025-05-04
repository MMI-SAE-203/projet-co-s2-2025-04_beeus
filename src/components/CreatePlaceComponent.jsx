import { useState, useCallback, memo, useMemo } from "react";
import SearchMap from "../components/SearchMap.jsx";
import PlaceCategories from "./SetPlaceCategories.jsx";
import SetStarNotation from "../components/SetStarNotation.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import { convertToWebP } from "../lib/pocketbase.mjs";

const MemoizedSearchMap = memo(SearchMap);
const MemoizedPlaceCategories = memo(PlaceCategories);
const MemoizedSetStarNotation = memo(SetStarNotation);

const ErrorMessage = memo(({ error }) =>
  !error ? null : (
    <div className="p-3 bg-red-100 border border-red-300 rounded-md">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  )
);

export default function CreatePlace() {
  const [formData, setFormData] = useState({
    selectedplace: null,
    selectedCategories: [],
    titre: "",
    description: "",
    notation: 0,
    images: [],
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [converting, setConverting] = useState(false);

  const {
    selectedplace,
    selectedCategories,
    titre,
    description,
    notation,
    images,
  } = formData;

  const handleInputChange = useCallback(
    (field) => (value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name.replace("Input", "")]: value }));
  }, []);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const converted = [];
    setConverting(true);

    for (const file of files) {
      if (file.type === "image/heic" || file.name.endsWith(".heic")) {
        try {
          const apiForm = new FormData();
          apiForm.append("image", file);

          const res = await fetch("/api/convert-image", {
            method: "POST",
            body: apiForm,
          });

          if (!res.ok) throw new Error("Erreur de conversion côté serveur");

          const blob = await res.blob();
          const convertedFile = new File(
            [blob],
            file.name.replace(/\.heic$/i, ".jpg"),
            {
              type: "image/jpeg",
            }
          );

          converted.push(convertedFile);
        } catch (error) {
          console.error("❌ Erreur de conversion HEIC:", error);
        }
      } else {
        converted.push(file);
      }
    }

    setConverting(false);

    const tooBig = converted.find((file) => file.size > 15 * 1024 * 1024);
    if (tooBig) {
      setError("Un des fichiers est trop volumineux (max 15 Mo)");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...converted],
    }));
  };

  const handleRemoveImage = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const isFormValid = useMemo(
    () => selectedplace && titre.trim(),
    [selectedplace, titre]
  );

  const handleSubmit = async () => {
    setError(null);
    setUploadProgress(0);

    if (!isFormValid) {
      setError(
        "Veuillez remplir le nom du lieu et sélectionner un emplacement."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      const simplifiedPlace = selectedplace
        ? {
            lat: selectedplace.lat,
            lon: selectedplace.lon,
            name: selectedplace.formattedAddress || "Lieu inconnu",
            adresse: selectedplace.formattedAddress || "",
          }
        : null;

      const jsonData = {
        place: simplifiedPlace,
        categories: selectedCategories,
        titre,
        description,
        notation,
      };

      formDataToSend.append("data", JSON.stringify(jsonData));
      for (const image of images) {
        const webp = await convertToWebP(image, 0.8);
        formDataToSend.append("images", webp);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          window.location.href = `/places/${result.slug}`;
        } else {
          const err = JSON.parse(xhr.responseText);
          throw new Error(err.error || "Erreur lors de la création du lieu.");
        }
      };

      xhr.onerror = () => {
        throw new Error("Erreur réseau lors de l'envoi.");
      };

      xhr.open("POST", "/api/create-place", true);
      xhr.send(formDataToSend);
    } catch (err) {
      console.error("❌ Erreur lors de la création :", err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const placeSelectCallback = useCallback(
    handleInputChange("selectedplace"),
    []
  );
  const categoriesChangeCallback = useCallback(
    handleInputChange("selectedCategories"),
    []
  );
  const notationChangeCallback = useCallback(handleInputChange("notation"), []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4 md:px-8 lg:px-32 mt-8 md:mt-12 mb-16">
      <h1 className="text-2xl md:text-3xl font-bold">
        Ajouter un nouveau lieu
      </h1>

      <div className="rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Localisation</h2>
        <MemoizedSearchMap onPlaceSelect={placeSelectCallback} />
      </div>

      <div className="rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Informations</h2>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="titreInput"
              className="block text-sm font-medium mb-1"
            >
              Nom du lieu*
            </label>
            <input
              type="text"
              id="titreInput"
              name="titreInput"
              value={titre}
              onChange={handleTextChange}
              placeholder="Ex: Jardin botanique"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <MemoizedSetStarNotation onChange={notationChangeCallback} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 px-4 md:px-8 lg:px-32">
              Catégories
            </label>
            <MemoizedPlaceCategories
              onSelectionChange={categoriesChangeCallback}
            />
          </div>

          <div>
            <label
              htmlFor="descriptionInput"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="descriptionInput"
              name="descriptionInput"
              value={description}
              onChange={handleTextChange}
              placeholder="Décris ce lieu pour donner envie aux autres !"
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-32 md:min-h-48 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <ImageUploader
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        images={images}
      />

      {converting && (
        <p className="text-sm text-gray-500 italic text-center">
          Conversion des images en cours...
        </p>
      )}

      <ErrorMessage error={error} />

      {isSubmitting && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm text-gray-500 mt-1 text-right">
            {uploadProgress}%
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid || converting}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer le lieu"}
        </button>
      </div>
    </div>
  );
}
