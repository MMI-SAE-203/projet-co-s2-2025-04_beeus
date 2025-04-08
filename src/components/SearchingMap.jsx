import { useState, useEffect, useCallback } from "react";
import { useMapLogic } from "../hooks/useMapLogic";
import { searchWithNominatim, searchWithOverpass } from "../lib/map";
import { KNOWN_CATEGORIES } from "../lib/knownCategories";
import { pb } from "../lib/pocketbase";

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
    } else {
      return null;
    }
    return { lat, lon, popupContent, iconType: "default", originalData: item };
  } catch {
    return null;
  }
}

export default function SpecificSearchMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [statusMessage, setStatusMessage] = useState("Entrez une recherche.");
  const [referenceCoords, setReferenceCoords] = useState(null);
  const {
    isLoading,
    setIsLoading,
    initializeMap,
    displayMarkers,
    setView,
    fitBounds,
    cleanupMap,
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

      let searchCenter = referenceCoords || DEFAULT_CITY_COORDS;
      let foundItems = [];
      let boundsToFit = null;

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
            const bestResult = results[0];
            const formattedResult = formatApiResultForDisplay(
              bestResult,
              "nominatim"
            );
            if (formattedResult) {
              foundItems = [formattedResult];

              const isAdmin = [
                "city",
                "town",
                "village",
                "administrative",
                "suburb",
              ].includes(bestResult.class?.toLowerCase());
              if (isAdmin) {
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
        console.error("Search failed:", error);
        setStatusMessage(`Erreur: ${error.message}`);
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
    ]
  );

  return (
    <div className="flex flex-col space-y-4 p-4 bg-gray-900 text-white h-screen">
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-4 items-stretch"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ville, lieu, catégorie..."
          className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          disabled={isLoading}
        />
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
            className="w-24 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
            disabled={isLoading}
          />
          <span className="w-8 text-right">{radiusKm}</span>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isLoading ? "..." : "Chercher"}
        </button>
      </form>
      <div className="text-sm text-gray-400">{statusMessage}</div>
      <div
        id={MAP_ID}
        className="flex-grow w-full rounded border border-gray-700 bg-gray-800 min-h-[400px]"
      ></div>
    </div>
  );
}
