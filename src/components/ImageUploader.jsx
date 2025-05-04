import React, { memo } from "react";

const ImageUploader = memo(({ onImageChange, images, onRemoveImage }) => (
  <div className="rounded-lg shadow-sm p-4 sm:p-6">
    <h2 className="text-lg font-medium mb-4">Photos</h2>
    <label
      htmlFor="imageInput"
      className="w-full min-h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer py-8 hover:bg-gray-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="mb-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span className="text-sm font-medium">Ajouter depuis votre appareil</span>
      <span className="text-xs mt-1 text-gray-400">JPG, PNG • 15 Mo max</span>
      <input
        type="file"
        multiple
        id="imageInput"
        name="imageInput"
        className="hidden"
        accept="image/*"
        onChange={onImageChange}
      />
    </label>

    {images.length > 0 && (
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-md overflow-hidden bg-gray-100 group"
          >
            <img
              src={URL.createObjectURL(img)}
              alt={`Aperçu ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Supprimer l'image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
));

export default ImageUploader;
