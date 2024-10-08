import supabase from '@/utils/supabaseClient';

// Function to fetch the admin location settings from the database
const getAdminSettings = async () => {
  let { data, error } = await supabase
    .from('AdminSettings')
    .select(
      'home_location_latitude, home_location_longitude, cost_per_mile_rate, cost_trip_surcharge, misc_range_limit_miles'
    )
    .single(); // There is only one row in this table

  return { data, error };
};

// Function to calculate the route between two locations
export const calculateRoute = async (
  origin,
  destination,
  setDistance,
  setDuration,
  setLoadingRoute,
  setExceedsRange
) => {
  const directionsService = new google.maps.DirectionsService();
  const { data, error } = await getAdminSettings();
  if (error) {
    console.error('Failed to fetch location data:', error);
    return;
  }

  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const distanceText = result.routes[0].legs[0].distance.text;
        const durationText = result.routes[0].legs[0].duration.text;

        const distanceInMiles = parseFloat(distanceText.replace(/[^\d.]/g, ''));
        const roundedDistance = Math.ceil(distanceInMiles);

        setDistance(`${roundedDistance} miles`);
        setDuration(durationText);
        setLoadingRoute(false);

        setExceedsRange(roundedDistance > data.misc_range_limit_miles);
      } else {
        console.error('Error fetching directions:', status);
        setLoadingRoute(false);
      }
    }
  );
};

// Function to calculate distance to the driver's location using dynamic data
export const calculateDistanceToCity = async (location, setExceedsRange) => {
  const { data, error } = await getAdminSettings();
  if (error) {
    console.error('Failed to fetch location data:', error);
    return;
  }

  const distanceService = new google.maps.DistanceMatrixService();
  distanceService.getDistanceMatrix(
    {
      origins: [
        { lat: data.home_location_latitude, lng: data.home_location_longitude },
      ],
      destinations: [location],
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        const distanceInMeters = result.rows[0].elements[0].distance.value;
        const distanceInMiles = distanceInMeters * 0.000621371;

        setExceedsRange(distanceInMiles > data.misc_range_limit_miles);
      } else {
        console.error('Error calculating distance to city:', status);
      }
    }
  );
};

export const calculateCost = async (distance) => {
  const { data, error } = await getAdminSettings();
  if (error) {
    console.error('Failed to fetch location data:', error);
    return;
  }
  const cost = distance * data.cost_per_mile_rate + data.cost_trip_surcharge;
  return Math.ceil(cost); // This ensures it's a whole number
};
