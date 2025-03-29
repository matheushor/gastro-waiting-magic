// Check if the customer is within the specified radius of the restaurant
export const isWithinRadius = (
  customerLat: number,
  customerLng: number,
  restaurantLat: number,
  restaurantLng: number,
  radiusInMeters: number
): boolean => {
  // Calculate distance between coordinates using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (customerLat * Math.PI) / 180;
  const φ2 = (restaurantLat * Math.PI) / 180;
  const Δφ = ((restaurantLat - customerLat) * Math.PI) / 180;
  const Δλ = ((restaurantLng - customerLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusInMeters;
};

// Get current position as a Promise
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// Restaurant location (updated with correct coordinates)
export const RESTAURANT_LOCATION = {
  lat: -21.205835175291195, // Updated coordinates
  lng: -47.80665877324732,   // Updated coordinates
  radius: 50 // radius in meters
};

// Format waiting time
export const formatWaitingTime = (timestamp: number): string => {
  const now = Date.now();
  const waitingTimeMs = now - timestamp;
  
  const minutes = Math.floor(waitingTimeMs / (1000 * 60));
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};
