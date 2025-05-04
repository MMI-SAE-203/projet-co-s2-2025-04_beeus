import { useState, useCallback, memo, useMemo } from "react";
import SearchMap from "../components/SearchMap.jsx";
import PlaceCategories from "./SetPlaceCategories.jsx";
import SetStarNotation from "../components/SetStarNotation.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import heic2any from "heic2any";

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

const UploadProgress = memo(({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
      style={{ width: `${progress}%` }}
    />
    <p className="text-sm text-gray-500 mt-1 text-right">{progress}%</p>
  </div>
));

const resizeAndCompressImage = async (file, maxWidth = 1200, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File(
                [blob],
                file.name.replace(/\.(jpe?g|png|gif|heic|webp)$/i, ".webp"),
                { type: "image/webp" }
              );
              resolve(newFile);
            } else {
              reject(new Error("Échec de compression de l'image"));
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () =>
        reject(new Error("Erreur lors du chargement de l'image"));
    };
    reader.onerror = () =>
      reject(new Error("Erreur lors de la lecture du fichier"));
  });
};

const processImages = async (files) => {
  const fileProcessPromises = files.map(async (file) => {
    try {
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.7,
        });
        const jpegFile = new File(
          [blob],
          file.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
        return await resizeAndCompressImage(jpegFile, 1200, 0.5);
      }
      return await resizeAndCompressImage(file, 1200, 0.5);
    } catch (err) {
      console.error("Erreur traitement image:", err);
      throw err;
    }
  });

  const processedFiles = await Promise.all(fileProcessPromises);

  processedFiles.forEach((file) => {
    if (file.size > 1024 * 1024) {
      console.warn(
        `Image ${file.name} toujours > 1Mo (${
          Math.round((file.size / 1024 / 1024) * 100) / 100
        }Mo) après compression`
      );
    }
  });

  return processedFiles;
};

export default function CreatePlace() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [notation, setNotation] = useState(0);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [converting, setConverting] = useState(false);

  const isFormValid = useMemo(
    () => selectedPlace && titre.trim().length > 0,
    [selectedPlace, titre]
  );

  const handlePlaceSelect = useCallback((place) => {
    setSelectedPlace(place);
    setError(null);
  }, []);

  const handleCategoriesChange = useCallback((categories) => {
    setSelectedCategories(categories);
  }, []);

  const handleNotationChange = useCallback((value) => {
    setNotation(value);
  }, []);

  const handleTitreChange = useCallback((e) => {
    setTitre(e.target.value);
    setError(null);
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
  }, []);

  const handleImageChange = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setConverting(true);
    setError(null);

    try {
      const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        throw new Error(
          `${oversizedFiles.length} image(s) dépassent 10 Mo. Veuillez les compresser avant l'envoi.`
        );
      }

      const largeFiles = files.filter((f) => f.size > 3 * 1024 * 1024);
      if (largeFiles.length > 0) {
        console.warn(
          `${largeFiles.length} image(s) > 3 Mo. Compression en cours...`
        );
      }

      const processed = await processImages(files);

      const originalSize = files.reduce((sum, f) => sum + f.size, 0);
      const newSize = processed.reduce((sum, f) => sum + f.size, 0);
      const saving = originalSize - newSize;
      const savingPercent = Math.round((saving / originalSize) * 100);

      console.info(
        `Compression: ${
          Math.round((originalSize / 1024 / 1024) * 100) / 100
        }Mo → ${
          Math.round((newSize / 1024 / 1024) * 100) / 100
        }Mo (${savingPercent}% économisés)`
      );

      setImages((prev) => [...prev, ...processed]);
    } catch (err) {
      setError(err.message || "Erreur lors du traitement des images");
    } finally {
      setConverting(false);
    }
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
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
      const simplifiedPlace = selectedPlace
        ? {
            lat: selectedPlace.lat,
            lon: selectedPlace.lon,
            name: selectedPlace.formattedAddress || "Lieu inconnu",
            adresse: selectedPlace.formattedAddress || "",
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
      images.forEach((img) => formDataToSend.append("images", img));

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
          try {
            const err = JSON.parse(xhr.responseText);
            setError(err.error || "Erreur lors de la création du lieu.");
          } catch (e) {
            setError(`Erreur serveur: ${xhr.status}`);
          }
          setIsSubmitting(false);
        }
      };

      xhr.onerror = () => {
        setError("Erreur réseau lors de l'envoi.");
        setIsSubmitting(false);
      };

      xhr.open("POST", "/api/create-place", true);
      xhr.send(formDataToSend);
    } catch (err) {
      console.error("❌ Erreur lors de la création :", err);
      setError(err.message || "Une erreur inattendue est survenue");
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    selectedPlace,
    selectedCategories,
    titre,
    description,
    notation,
    images,
  ]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4 md:px-8 lg:px-32 mt-8 md:mt-12 mb-16">
      <h1 className="text-2xl md:text-3xl font-bold">
        Ajouter un nouveau lieu
      </h1>
      <div className="rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Localisation</h2>
        <MemoizedSearchMap onPlaceSelect={handlePlaceSelect} />
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
              id="titreInput"
              type="text"
              value={titre}
              onChange={handleTitreChange}
              placeholder="Ex: Jardin botanique"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <MemoizedSetStarNotation onChange={handleNotationChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catégories</label>
            <MemoizedPlaceCategories
              onSelectionChange={handleCategoriesChange}
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
              value={description}
              onChange={handleDescriptionChange}
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
        <div className="flex justify-center items-center mt-4">
          <div className="w-8 h-8 min-w-8 min-h-8 border-4 border-(--color-violet) border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-sm text-gray-500 italic">
            Importation des images en cours... Veuillez patienter.
          </p>
        </div>
      )}

      <ErrorMessage error={error} />
      {isSubmitting && uploadProgress > 0 && (
        <UploadProgress progress={uploadProgress} />
      )}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid || converting}
          className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer le lieu"}
        </button>
      </div>
    </div>
  );
}
