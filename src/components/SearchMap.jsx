import { useState, useEffect, useCallback } from "react";
import { useMapLogic } from "../lib/useMapLogic.js";
import { searchWithNominatim, searchWithOverpass } from "../lib/map.js";
import { KNOWN_CATEGORIES } from "../lib/knownCategories.js";
import { pb } from "../lib/pocketbase.mjs";
import { formatAdresse } from "../lib/utils.js";
import searchIcon from "../icons/search.svg";

const DEFAULT_CITY_COORDS = { lat: 48.8566, lon: 2.3522 };
const MAP_ID = "specific-search-map";

function formatApiResultForDisplay(item, source) {
  try {
    let lat, lon, popupContent, name, formattedAddress;
    const timestamp = new Date().toISOString();

    if (source === "overpass") {
      const tags = item.tags || {};
      if (item.type === "node") {
        lat = item.lat;
        lon = item.lon;
      } else if (item.center) {
        lat = item.center.lat;
        lon = item.center.lon;
      } else return null;

      name = tags.name || tags.official_name || tags.brand || "Lieu OSM";
      const addrNumber = tags["addr:housenumber"] || "";
      const addrStreet = tags["addr:street"] || tags["addr:place"] || "";
      const addrCity =
        tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "";
      const addrCounty =
        tags["addr:county"] || tags["addr:state_district"] || "";
      formattedAddress =
        formatAdresse({
          number: addrNumber,
          street: addrStreet,
          locality: addrCity,
          county: addrCounty,
        }) || name;

      popupContent = `
        <b>${name}</b><br/>
        ${formattedAddress}<br/>
        <small>${new Date().toLocaleString()}</small>
      `;
      return {
        lat,
        lon,
        popupContent,
        iconType: "place",
        name,
        formattedAddress,
      };
    }

    if (source === "nominatim") {
      if (!item.lat || !item.lon) return null;
      lat = parseFloat(item.lat);
      lon = parseFloat(item.lon);

      const {
        house_number,
        road,
        pedestrian,
        building,
        neighbourhood,
        postcode,
        city,
        town,
        village,
        suburb,
        municipality,
        county,
        state,
        district,
        subdistrict,
      } = item.address || {};

      const numero = house_number || "";
      const rue = road || pedestrian || building || neighbourhood || "";
      const ville =
        city || town || village || suburb || municipality || postcode || "";
      const departement = county || district || subdistrict || state || "";

      const structured = formatAdresse({
        number: numero,
        street: rue,
        locality: ville,
        county: departement,
      });
      formattedAddress = structured || item.display_name;
      name = structured || item.display_name.split(",")[0] || "Inconnu";

      popupContent = `
        <b>${name}</b><br/>
        ${formattedAddress}<br/>
        <small>${new Date().toLocaleString()}</small>
      `;
      return {
        lat,
        lon,
        popupContent,
        iconType: "place",
        name,
        formattedAddress,
        fullAddress: item.display_name,
        result: item,
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur formatApiResultForDisplay:", error);
    return null;
  }
}

export default function SpecificSearchMap({ onPlaceSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [statusMessage, setStatusMessage] = useState("Entrez une recherche.");
  const [referenceCoords, setReferenceCoords] = useState(null);
  const [currentMarkersData, setCurrentMarkersData] = useState([]);

  const {
    isLoading,
    setIsLoading,
    initializeMap,
    displayMarkers,
    setView,
    fitBounds,
  } = useMapLogic();

  const createPopupWithButton = useCallback((marker) => {
    const base = marker.popupContent;
    const markerName = marker.name || "";
    const formatted = marker.formattedAddress || "";
    const full = marker.fullAddress || formatted;

    const selectButton = `
      <div class="mt-2">
        <button
          class="select-place-btn bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm cursor-pointer"
          data-lat="${marker.lat}"
          data-lon="${marker.lon}"
          data-name="${markerName.replace(/"/g, "&quot;")}"
          data-address="${formatted.replace(/"/g, "&quot;")}"
          data-fulladdress="${full.replace(/"/g, "&quot;")}"
        >
          Sélectionner ce lieu
        </button>
      </div>
    `;
    return `${base}${selectButton}`;
  }, []);

  const handleMapDelegatedClick = useCallback(
    async (e) => {
      if (e.target && e.target.classList.contains("select-place-btn")) {
        const lat = parseFloat(e.target.getAttribute("data-lat"));
        const lon = parseFloat(e.target.getAttribute("data-lon"));
        const name = e.target.getAttribute("data-name");
        const formattedAddress = e.target.getAttribute("data-address");
        const fullAddress = e.target.getAttribute("data-fulladdress");

        let finalAddress = fullAddress;
        if (!fullAddress || finalAddress === name) {
          try {
            const resp = await fetch(
              `/api/reverse-nominatim?lat=${lat}&lon=${lon}`
            );

            const data = await resp.json();
            if (data.display_name) finalAddress = data.display_name;
          } catch (err) {
            console.warn("Reverse geocoding failed:", err);
          }
        }
        const selectedPlace = {
          lat,
          lon,
          name,
          adresse: finalAddress,
          formattedAddress,
          fullAddress: finalAddress,
        };
        if (typeof onPlaceSelect === "function") onPlaceSelect(selectedPlace);

        e.target.textContent = "Lieu sélectionné ✓";
        e.target.classList.replace("bg-indigo-600", "bg-green-600");
        e.target.disabled = true;

        setStatusMessage(`Lieu sélectionné : ${name} — ${fullAddress}`);
      }
    },
    [onPlaceSelect]
  );

  useEffect(() => {
    let isMounted = true;
    const id = MAP_ID;
    (async () => {
      let coords = DEFAULT_CITY_COORDS,
        zoom = 12;
      try {
        if (pb.authStore.isValid && pb.authStore.model?.id) {
          const user = await pb
            .collection("users")
            .getOne(pb.authStore.model.id, { fields: "ville" });
          if (user.ville) {
            const cityData = await fetch(
              `/api/nominatim?q=${encodeURIComponent(user.ville)}`
            ).then((res) => res.json());

            if (cityData?.[0]?.lat) {
              coords = { lat: +cityData[0].lat, lon: +cityData[0].lon };
              zoom = 13;
              isMounted && setReferenceCoords(coords);
            }
          }
        }
      } catch (err) {
        console.warn(err);
      }
      if (isMounted) {
        initializeMap(id, coords, zoom);
        document
          .getElementById(id)
          ?.addEventListener("click", handleMapDelegatedClick);
      }
    })();
    return () => {
      isMounted = false;
      document
        .getElementById(MAP_ID)
        ?.removeEventListener("click", handleMapDelegatedClick);
    };
  }, [initializeMap, handleMapDelegatedClick]);

  const displayMarkersWithButtons = useCallback(
    (markers) => {
      setCurrentMarkersData(markers);
      return displayMarkers(
        markers.map((m) => ({ ...m, popupContent: createPopupWithButton(m) }))
      );
    },
    [displayMarkers, createPopupWithButton]
  );

  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault();
      const q = searchQuery.trim();
      if (!q) {
        setStatusMessage("Veuillez entrer une recherche.");
        return;
      }
      setIsLoading(true);
      setStatusMessage("Recherche...");
      displayMarkersWithButtons([]);

      const center = referenceCoords || DEFAULT_CITY_COORDS;
      let found = [];
      try {
        const catTag = KNOWN_CATEGORIES[q.toLowerCase()];
        if (catTag) {
          let key, val;
          if (catTag.includes("=")) [key, val] = catTag.split(/=(.*)/s);
          else key = catTag;
          const res = await searchWithOverpass(
            key,
            val,
            center.lat,
            center.lon,
            radiusKm * 1000
          );
          found = res
            .map((i) => formatApiResultForDisplay(i, "overpass"))
            .filter(Boolean);
        } else {
          const res = await searchWithNominatim(q, center, 10);
          if (res.length) {
            let best = res[0];
            const cityTypes = [
              "city",
              "town",
              "administrative",
              "village",
              "suburb",
            ];
            const cityRes = res.find((r) =>
              cityTypes.includes((r.class || r.type || "").toLowerCase())
            );
            if (cityRes) best = cityRes;
            const fmt = formatApiResultForDisplay(best, "nominatim");
            if (fmt) {
              found = [fmt];
              setReferenceCoords({ lat: fmt.lat, lon: fmt.lon });
              setView(
                { lat: fmt.lat, lon: fmt.lon },
                cityTypes.includes(
                  (best.class || best.type || "").toLowerCase()
                )
                  ? 13
                  : 16
              );
            }
          }
        }
        if (found.length) {
          const bounds = displayMarkersWithButtons(found);
          bounds?.length > 1
            ? fitBounds(bounds)
            : bounds?.[0] &&
              setView({ lat: bounds[0][0], lon: bounds[0][1] }, 16);
          setStatusMessage(
            `${found.length} résultat(s) trouvé(s). Cliquez pour sélectionner.`
          );
        } else setStatusMessage(`Aucun résultat pour "${q}".`);
      } catch (error) {
        console.error(error);
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
      setView,
      fitBounds,
      displayMarkersWithButtons,
    ]
  );

  return (
    <div className="flex flex-col text-white h-fit w-full z-30">
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-4 mb-2"
      >
        <div className="flex items-center justify-between w-full px-4 py-2 border border-white rounded-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher lieu ou catégorie"
            disabled={isLoading}
            className="w-full bg-transparent outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Lancer la recherche"
          >
            <img src={searchIcon.src} alt="Recherche" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="radius" className="text-sm">
            Rayon (km):
          </label>
          <input
            id="radius"
            type="range"
            min="1"
            max="150"
            value={radiusKm}
            onChange={(e) => setRadiusKm(+e.target.value)}
            disabled={isLoading}
            className="w-full h-2 appearance-none accent-indigo-500 bg-zinc-100 rounded-full"
          />
          <span className="w-8 text-right text-sm">{radiusKm}</span>
        </div>
      </form>
      <div className="text-sm text-gray-400 py-2 min-h-[1.25rem]">
        {statusMessage}
      </div>
      <div
        id={MAP_ID}
        className="flex-grow border border-gray-700 rounded bg-gray-800 min-h-[300px]"
        role="application"
        aria-label="Carte interactive"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <p className="text-white text-lg">Chargement...</p>
          </div>
        )}
      </div>
    </div>
  );
}
