import { useState, useRef, useCallback, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import placeVioletSvg from "../icons/place-violet.svg?url";
import placeYelowSvg from "../icons/place-yellow.svg?url";

export const placeIcon = L.icon({
  iconUrl: placeVioletSvg,
  iconSize: [20, 25],
  iconAnchor: [10, 25],
  popupAnchor: [0, -25],
});

export const eventIcon = L.icon({
  iconUrl: placeYelowSvg,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const defaultIcon = new L.Icon.Default();

const ICONS = {
  default: defaultIcon,
  place: placeIcon,
  event: eventIcon,
};

export function useMapLogic() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCenter, setCurrentCenter] = useState(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const mapContainerIdRef = useRef(null);

  const initializeMap = useCallback(
    (containerId, initialCoords, initialZoom) => {
      if (
        mapInstanceRef.current &&
        mapInstanceRef.current.getContainer().id === containerId
      ) {
        mapInstanceRef.current.setView(
          [initialCoords.lat, initialCoords.lon],
          initialZoom
        );

        // S'assurer que le déplacement est activé
        mapInstanceRef.current.dragging.enable();
        mapInstanceRef.current.touchZoom.enable();
        mapInstanceRef.current.doubleClickZoom.enable();
        mapInstanceRef.current.scrollWheelZoom.enable();
        mapInstanceRef.current.keyboard.enable();

        return;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      mapContainerIdRef.current = containerId;

      try {
        const mapElement = document.getElementById(containerId);
        if (!mapElement) {
          console.warn(
            `Le conteneur de carte #${containerId} est introuvable.`
          );
          return;
        }

        // Vérifier si l'élément a déjà un _leaflet_id et le nettoyer si nécessaire
        if (mapElement._leaflet_id) {
          mapElement._leaflet_id = null;
          mapElement.innerHTML = "";
        }

        const map = L.map(containerId).setView(
          [initialCoords.lat, initialCoords.lon],
          initialZoom
        );

        // Activer explicitement le déplacement et le zoom
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.keyboard.enable();

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OSM contributors",
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        map.on("moveend zoomend", () => {
          if (!mapInstanceRef.current) return;
          const center = mapInstanceRef.current.getCenter();
          setCurrentCenter({ lat: center.lat, lon: center.lng });
        });

        // Ajouter un gestionnaire d'événements de débogage
        map.on("click", (e) => {
          console.log("Map clicked at:", e.latlng);
        });

        setCurrentCenter(initialCoords);
      } catch (error) {
        console.error(
          `Échec de l'initialisation de la carte sur #${containerId} :`,
          error
        );
        const mapElement = document.getElementById(containerId);
        if (mapElement)
          mapElement.innerHTML = "Erreur d'initialisation de la carte.";
      }
    },
    []
  );

  const displayMarkers = useCallback((markersData = []) => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return [];
    markersLayerRef.current.clearLayers();
    const leafletMarkers = [];
    const validCoords = [];

    markersData.forEach((data) => {
      try {
        if (typeof data.lat !== "number" || typeof data.lon !== "number") {
          console.warn(
            "Marqueur ignoré à cause de coordonnées invalides :",
            data
          );
          return;
        }

        let chosenIcon = ICONS[data.iconType] || ICONS.default;

        const marker = L.marker([data.lat, data.lon], {
          icon: chosenIcon,
        }).bindPopup(data.popupContent || "", { maxWidth: 250 });

        leafletMarkers.push(marker);
        validCoords.push([data.lat, data.lon]);
      } catch (e) {
        console.error("Échec de création du marqueur pour :", data, e);
      }
    });

    leafletMarkers.forEach((m) => m.addTo(markersLayerRef.current));
    return validCoords;
  }, []);

  const setView = useCallback((coords, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([coords.lat, coords.lon], zoom);
      // Vérifier si le déplacement est activé
      if (!mapInstanceRef.current.dragging.enabled()) {
        mapInstanceRef.current.dragging.enable();
      }
    }
  }, []);

  const fitBounds = useCallback((coordsArray) => {
    if (
      !mapInstanceRef.current ||
      !Array.isArray(coordsArray) ||
      coordsArray.length === 0
    )
      return;
    try {
      const bounds = L.latLngBounds(coordsArray);
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 17,
        });
      } else {
        console.warn(
          "fitBounds ignoré : limites invalides générées à partir des coordonnées :",
          coordsArray
        );
      }
    } catch (e) {
      console.error("Impossible d'ajuster la vue sur les limites :", e);
    }
  }, []);

  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      mapContainerIdRef.current = null;
      console.log("Carte nettoyée.");
    }
  }, []);

  const centerOnCity = useCallback(
    (cityResult) => {
      if (cityResult && cityResult.lat && cityResult.lon) {
        const lat = parseFloat(cityResult.lat);
        const lon = parseFloat(cityResult.lon);
        const lowerType = cityResult.class
          ? cityResult.class.toLowerCase()
          : cityResult.type
          ? cityResult.type.toLowerCase()
          : "";
        const isCity =
          lowerType === "city" ||
          lowerType === "town" ||
          lowerType === "administrative";
        const zoom = isCity ? 13 : 16;
        setView({ lat, lon }, zoom);
        setCurrentCenter({ lat, lon });
      }
    },
    [setView]
  );

  // Ajout d'une fonction pour vérifier et réactiver les contrôles
  const checkAndEnableControls = useCallback(() => {
    if (mapInstanceRef.current) {
      if (!mapInstanceRef.current.dragging.enabled()) {
        console.log("Réactivation du déplacement de la carte");
        mapInstanceRef.current.dragging.enable();
      }
      if (!mapInstanceRef.current.touchZoom.enabled()) {
        mapInstanceRef.current.touchZoom.enable();
      }
      if (!mapInstanceRef.current.doubleClickZoom.enabled()) {
        mapInstanceRef.current.doubleClickZoom.enable();
      }
      if (!mapInstanceRef.current.scrollWheelZoom.enabled()) {
        mapInstanceRef.current.scrollWheelZoom.enable();
      }
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  return {
    isLoading,
    setIsLoading,
    currentCenter,
    initializeMap,
    displayMarkers,
    setView,
    fitBounds,
    centerOnCity,
    checkAndEnableControls,
  };
}
