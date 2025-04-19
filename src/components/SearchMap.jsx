import { useState, useEffect, useCallback } from "react";
import { useMapLogic } from "../lib/useMapLogic.js";
import { searchWithNominatim, searchWithOverpass } from "../lib/map.js";
import { KNOWN_CATEGORIES } from "../lib/knownCategories.js";
import { pb } from "../lib/pocketbase";
import searchIcon from "../icons/search.svg";

const DEFAULT_CITY_COORDS = { lat: 48.8566, lon: 2.3522 };
const MAP_ID = "specific-search-map";

function formatApiResultForDisplay(item, source) {
  let lat, lon, popupContent, name;
  try {
    if (source === "overpass") {
      const tags = item.tags || {};
      if (item.type === "node") {
        lat = item.lat;
        lon = item.lon;
      } else if (item.center) {
        lat = item.center.lat;
        lon = item.center.lon;
      } else return null;
      name = tags.name || tags["official_name"] || tags.brand || "Lieu OSM";
      popupContent = `<b>${name}</b><br/><i>Type: ${
        tags.amenity || tags.shop || tags.leisure || "N/A"
      }</i>`;
      return { lat, lon, popupContent, iconType: "place" };
    } else if (source === "nominatim") {
      if (!item.lat || !item.lon) return null;
      lat = parseFloat(item.lat);
      lon = parseFloat(item.lon);
      name =
        item.address?.amenity ||
        item.address?.shop ||
        item.name ||
        item.display_name.split(",")[0];
      popupContent = `<b>${name}</b><br/>${item.display_name}`;
      return { lat, lon, popupContent, iconType: "place", result: item };
    }
    return null;
  } catch {
    return null;
  }
}

export default function SpecificSearchMap({ onPlaceSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [statusMessage, setStatusMessage] = useState("Entrez une recherche.");
  const [referenceCoords, setReferenceCoords] = useState(null);

  const {
    isLoading,
    setIsLoading,
    initializeMap,
    displayMarkers,
    setView,
    fitBounds,
  } = useMapLogic();

  useEffect(() => {
    let isMounted = true;

    const fetchInitialCoords = async () => {
      let coords = DEFAULT_CITY_COORDS;
      let zoom = 12;

      try {
        if (pb.authStore.isValid && pb.authStore.model?.id) {
          const user = await pb
            .collection("users")
            .getOne(pb.authStore.model.id, { fields: "ville" });

          if (user.ville) {
            const cityData = await searchWithNominatim(user.ville, null, 1);
            if (cityData?.[0]?.lat && cityData?.[0]?.lon) {
              coords = {
                lat: parseFloat(cityData[0].lat),
                lon: parseFloat(cityData[0].lon),
              };
              zoom = 13;
              if (isMounted) setReferenceCoords(coords);
            }
          }
        }
      } catch {}

      if (isMounted) {
        initializeMap(MAP_ID, coords, zoom);
      }
    };

    fetchInitialCoords();
    return () => {
      isMounted = false;
    };
  }, [initializeMap]);

  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault();
      const query = searchQuery.trim();

      if (!query) {
        setStatusMessage("Veuillez entrer une recherche.");
        return;
      }

      setIsLoading(true);
      setStatusMessage("Recherche...");
      displayMarkers([]);

      const searchCenter = referenceCoords || DEFAULT_CITY_COORDS;
      let foundItems = [];

      try {
        const lowerQuery = query.toLowerCase();
        const categoryTag = KNOWN_CATEGORIES[lowerQuery];

        if (categoryTag) {
          if (!searchCenter) {
            setStatusMessage(
              "Veuillez d'abord rechercher une ville pour chercher une catégorie."
            );
            setIsLoading(false);
            return;
          }

          let key, value;
          if (categoryTag.includes("=")) {
            [key, value] = categoryTag.split(/=(.*)/s);
          } else if (categoryTag.includes("][")) {
            key = categoryTag;
            value = undefined;
          } else {
            key = categoryTag;
            value = null;
          }

          const results = await searchWithOverpass(
            key,
            value,
            searchCenter.lat,
            searchCenter.lon,
            radiusKm * 1000
          );
          foundItems = results
            .map((item) => formatApiResultForDisplay(item, "overpass"))
            .filter(Boolean);
        } else {
          const results = await searchWithNominatim(query, searchCenter, 10);

          if (results.length > 0) {
            let bestResult = results[0];
            const cityTypes = [
              "city",
              "town",
              "administrative",
              "village",
              "suburb",
            ];

            const cityResult = results.find((result) => {
              const lowerType =
                result.class?.toLowerCase() || result.type?.toLowerCase() || "";
              return cityTypes.includes(lowerType);
            });

            if (cityResult) bestResult = cityResult;

            const formattedResult = formatApiResultForDisplay(
              bestResult,
              "nominatim"
            );

            if (formattedResult) {
              foundItems = [formattedResult];
              onPlaceSelect?.(formattedResult);

              const lowerType =
                bestResult.class?.toLowerCase() ||
                bestResult.type?.toLowerCase() ||
                "";

              if (cityTypes.includes(lowerType)) {
                const newCoords = {
                  lat: formattedResult.lat,
                  lon: formattedResult.lon,
                };
                setReferenceCoords(newCoords);
                setView(newCoords, 13);
              } else {
                setView(
                  { lat: formattedResult.lat, lon: formattedResult.lon },
                  16
                );
              }
            }
          }
        }

        if (foundItems.length > 0) {
          const coords = displayMarkers(foundItems);

          if (coords.length > 1) {
            fitBounds(coords);
          } else if (coords.length === 1 && !referenceCoords) {
            setView({ lat: coords[0][0], lon: coords[0][1] }, 16);
          }

          setStatusMessage(`${foundItems.length} résultat(s) trouvé(s).`);
        } else {
          setStatusMessage(`Aucun résultat trouvé pour "${query}".`);
        }
      } catch (error) {
        console.error("Échec de la recherche :", error);
        setStatusMessage(`Erreur : ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [
      searchQuery,
      radiusKm,
      referenceCoords,
      setIsLoading,
      displayMarkers,
      setView,
      fitBounds,
      onPlaceSelect,
    ]
  );

  return (
    <div className="flex flex-col text-white h-fit w-full">
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-4 items-stretch"
      >
        <div className="flex items-center justify-between w-full px-8 py-2 border border-white text-white rounded-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un lieu"
            disabled={isLoading}
            className="w-full bg-transparent outline-none placeholder:text-gray-400"
          />
          <button type="submit" disabled={isLoading}>
            <img src={searchIcon.src} alt="Icon recherche" loading="lazy" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="radius" className="whitespace-nowrap">
            Rayon (km):
          </label>
          <input
            id="radius"
            type="range"
            min="1"
            max="150"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
            disabled={isLoading}
          />
          <span className="w-8 text-right">{radiusKm}</span>
        </div>
      </form>
      <div className="text-sm text-gray-400 py-2">{statusMessage}</div>
      <div
        id={MAP_ID}
        className="flex-grow w-full rounded border border-gray-700 bg-gray-800 min-h-[200px]  -z-10"
      ></div>
    </div>
  );
}
