/// <reference types="google.maps" />
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaceWithStats } from "@/hooks/use-mapa";

// Light Google Maps style aligned with the rest of the app (#F7F5FB + violet accents).
const LIGHT_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#F4F0FA" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B21D9" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4C1D95" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#E5DAF7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#EADFFB" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#D9C9F2" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6B21D9" }] },
];

const CABA_CENTER = { lat: -34.61, lng: -58.42 };

declare global {
  interface Window {
    initMapaCABA?: () => void;
    gm_authFailure?: () => void;
    google: typeof google;
    __mapaCabaGoogleMapsPromise?: Promise<void>;
  }
}

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.Map) return Promise.resolve();
  if (window.__mapaCabaGoogleMapsPromise) return window.__mapaCabaGoogleMapsPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  if (!key) {
    return Promise.reject(new Error("Falta configurar Google Maps"));
  }

  window.__mapaCabaGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const previousCallback = window.initMapaCABA;
    const previousAuthFailure = window.gm_authFailure;
    window.initMapaCABA = () => {
      previousCallback?.();
      resolve();
    };
    window.gm_authFailure = () => {
      previousAuthFailure?.();
      window.dispatchEvent(new CustomEvent("mapa-caba-auth-failure"));
      window.__mapaCabaGoogleMapsPromise = undefined;
      reject(new Error("No se pudo cargar Google Maps en este dominio"));
    };

    const s = document.createElement("script");
    const params = new URLSearchParams({
      key,
      loading: "async",
      callback: "initMapaCABA",
    });
    if (channel) params.set("channel", channel);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      window.__mapaCabaGoogleMapsPromise = undefined;
      reject(new Error("No se pudo cargar Google Maps"));
    };
    document.head.appendChild(s);
  });

  return window.__mapaCabaGoogleMapsPromise;
}

type Props = {
  places: PlaceWithStats[];
  onSelectPlace: (place: PlaceWithStats) => void;
};

export function MapaCABA({ places, onSelectPlace }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps?.Marker) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    for (const p of places) {
      const total = p.stats?.total_dreams ?? 0;
      const size = Math.max(9, Math.min(24, 9 + total * 1.6));
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        title: `${p.name} · ${total} sueños`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: size,
          fillColor: p.is_verified ? "#C026D3" : "#8B5CF6",
          fillOpacity: 0.75,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelectPlace(p));
      markersRef.current.push(marker);
    }
  }, [places, onSelectPlace]);

  useEffect(() => {
    let cancelled = false;
    let errorObserver: MutationObserver | null = null;
    let errorPoll: number | undefined;

    const detectEmbeddedGoogleError = () => {
      if (containerRef.current?.querySelector(".gm-err-container, .gm-err-message")) {
        setMapError("No se pudo cargar Google Maps en este dominio");
      }
    };
    const handleAuthFailure = () => {
      setMapError("No se pudo cargar Google Maps en este dominio");
    };
    window.addEventListener("mapa-caba-auth-failure", handleAuthFailure);
    if (containerRef.current) {
      errorObserver = new MutationObserver(detectEmbeddedGoogleError);
      errorObserver.observe(containerRef.current, { childList: true, subtree: true });
      errorPoll = window.setInterval(detectEmbeddedGoogleError, 500);
    }

    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      try {
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: CABA_CENTER,
          zoom: 12,
          styles: LIGHT_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          gestureHandling: "greedy",
          backgroundColor: "#F4F0FA",
        });
        setMapReady(true);
        setMapError(null);
      } catch (error) {
        console.error(error);
        setMapError("No se pudo inicializar Google Maps");
      }
    }).catch((error) => {
      console.error(error);
      setMapError(error instanceof Error ? error.message : "No se pudo cargar Google Maps");
    });

    return () => {
      cancelled = true;
      window.removeEventListener("mapa-caba-auth-failure", handleAuthFailure);
      errorObserver?.disconnect();
      if (errorPoll) window.clearInterval(errorPoll);
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    try {
      renderMarkers();
    } catch (error) {
      console.error(error);
      setMapError("No se pudieron dibujar los sueños en el mapa");
    }
  }, [mapReady, renderMarkers]);

  return (
    <div className="relative h-full w-full" style={{ background: "#F4F0FA" }}>
      <div
        ref={containerRef}
        className={`h-full w-full ${mapError ? "hidden" : ""}`}
        aria-label="Mapa de sueños de Buenos Aires"
      />
      {mapError && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg bg-rose-100 px-4 py-3 text-center text-sm text-rose-700 ring-1 ring-rose-300/60 backdrop-blur">
          {mapError}
        </div>
      )}
    </div>
  );
}
