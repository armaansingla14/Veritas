"use client";

import { useEffect, useRef, useState } from "react";
import type { Report } from "../../drizzle/schema";

interface ReportMapProps {
  reports: Report[];
  onReportSelect: (report: Report) => void;
  selectedReportId?: string;
}

// Kingston city center coordinates
const KINGSTON_CENTER = { lat: 44.2312, lng: -76.486 };

const typeColors: Record<string, string> = {
  pothole: "#f97316",
  noise: "#a855f7",
  parking: "#3b82f6",
  graffiti: "#ec4899",
  streetlight: "#eab308",
  sidewalk: "#22c55e",
  other: "#6b7280",
};

export function ReportMap({
  reports,
  onReportSelect,
  selectedReportId,
}: ReportMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const initializingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initializingRef.current) return;
    initializingRef.current = true;

    const loadMap = async () => {
      if (typeof window === "undefined") return;

      const container = mapContainerRef.current;
      if (!container) return;

      const L = (await import("leaflet")).default;

      // Fix for default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      // Clean up any existing Leaflet state
      const containerAny = container as any;
      if (containerAny._leaflet_id) {
        delete containerAny._leaflet_id;
      }
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const map = L.map(container).setView(
        [KINGSTON_CENTER.lat, KINGSTON_CENTER.lng],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initializingRef.current = false;
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current || !isLoaded) return;

      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];

      // Add new markers
      reports.forEach((report) => {
        const color = typeColors[report.type] || typeColors.other;
        const isSelected = report.id === selectedReportId;

        // Create custom icon
        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${isSelected ? "32px" : "24px"};
              height: ${isSelected ? "32px" : "24px"};
              background-color: ${color};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              transition: all 0.2s;
              ${isSelected ? "transform: scale(1.2);" : ""}
            "></div>
          `,
          iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
          iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
        });

        const marker = L.marker([report.latitude, report.longitude], { icon })
          .addTo(map)
          .on("click", () => onReportSelect(report));

        // Add popup
        const popupContent = `
          <div style="min-width: 150px;">
            <strong>${report.triageTitle || report.type}</strong>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              ${report.address.split(",")[0]}
            </p>
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 11px;
              background-color: ${color};
              color: white;
            ">${report.status.replace("_", " ")}</span>
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current.push(marker);
      });

      // Fit bounds if we have reports
      if (reports.length > 0) {
        const bounds = L.latLngBounds(
          reports.map((r) => [r.latitude, r.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    };

    updateMarkers();
  }, [reports, selectedReportId, isLoaded, onReportSelect]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full rounded-lg overflow-hidden"
      role="application"
      aria-label="Map showing reported issues"
    />
  );
}
