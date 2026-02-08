/**
 * Forward geocoding utility using OpenStreetMap Nominatim API
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  display: string;
}

export interface SearchOptions {
  countryCode?: string;
  nearLat?: number;
  nearLng?: number;
}

/**
 * Searches for addresses matching a query using Nominatim API
 * @param query The search query
 * @param limit Maximum number of results to return (default 5)
 * @param options Optional parameters for country filtering and location biasing
 * @returns Array of matching addresses
 */
export async function searchAddresses(
  query: string,
  limit: number = 5,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    // Build URL with optional parameters
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`;

    // Add country filter (default to Canada)
    const countryCode = options?.countryCode ?? "ca";
    url += `&countrycodes=${countryCode}`;

    // Add location bias if provided (creates a viewbox around the location)
    if (options?.nearLat !== undefined && options?.nearLng !== undefined) {
      // Create a ~50km bounding box around the user's location
      const delta = 0.5; // roughly 50km
      const viewbox = `${options.nearLng - delta},${options.nearLat + delta},${options.nearLng + delta},${options.nearLat - delta}`;
      url += `&viewbox=${viewbox}&bounded=0`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Veritas-CivicReporting/1.0",
      },
    });

    if (!response.ok) {
      console.error("Geocoding search failed:", response.status);
      return [];
    }

    const data = await response.json();

    return data.map((item: { lat: string; lon: string; display_name: string }) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display: item.display_name,
    }));
  } catch (error) {
    console.error("Geocoding search error:", error);
    return [];
  }
}

/**
 * Converts an address string to coordinates using Nominatim API
 * @param address The address to geocode
 * @returns Coordinates and display name, or null if not found
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "User-Agent": "Veritas-CivicReporting/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Geocoding request failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
