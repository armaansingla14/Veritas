"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

// Kingston city center coordinates
const KINGSTON_CENTER = { lat: 44.2312, lng: -76.486 };

export function MapPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const initializingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializingRef.current) return;
    initializingRef.current = true;

    // Dynamic import of Leaflet
    const loadMap = async () => {
      if (typeof window === "undefined") return;

      const container = mapContainerRef.current;
      if (!container) return;

      const L = (await import("leaflet")).default;

      // Fix for default marker icons in webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Clean up any existing Leaflet state
      const containerAny = container as any;
      if (containerAny._leaflet_id) {
        delete containerAny._leaflet_id;
      }
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const initialCenter = {
        lat: initialLat || KINGSTON_CENTER.lat,
        lng: initialLng || KINGSTON_CENTER.lng,
      };

      const map = L.map(container).setView(
        [initialCenter.lat, initialCenter.lng],
        14
      );

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add initial marker if coordinates provided
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng]).addTo(map);
        reverseGeocode(initialLat, initialLng);
      }

      // Handle map clicks
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(map);

        // Reverse geocode to get address
        await reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initializingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      const addr =
        data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(addr);
      onLocationSelect(lat, lng, addr);
    } catch (error) {
      console.error("Geocoding error:", error);
      const fallbackAddr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackAddr);
      onLocationSelect(lat, lng, fallbackAddr);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="h-[300px] w-full rounded-xl border border-slate-700 overflow-hidden"
          role="application"
          aria-label="Map for selecting location"
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/90 rounded-xl">
            <div className="text-center text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p>Loading map...</p>
            </div>
          </div>
        )}
      </div>
      {address && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
          <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-white">Selected Location</p>
            <p className="text-slate-400">{address}</p>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Click on the map to select the issue location
      </p>
    </div>
  );
}
