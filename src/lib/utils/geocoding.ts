export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formatted: string;
}

export async function getCoordinates(city: string, province: string): Promise<GeocodingResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'YOUR_API_KEY';
    
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      return null;
    }

    const query = `${city}, ${province}, Indonesia`;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=1&language=id`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.lat,
        longitude: result.geometry.lng,
        formatted: result.formatted,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
