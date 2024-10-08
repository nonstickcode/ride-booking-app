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

  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const distanceText = result.routes[0].legs[0].distance.text;
        const durationText = result.routes[0].legs[0].duration.text; // No conversion, use as is

        // Extract numeric value for distance and round it up
        const distanceInMiles = parseFloat(distanceText.replace(/[^\d.]/g, '')); // Remove non-numeric characters
        const roundedDistance = Math.ceil(distanceInMiles);

        setDistance(`${roundedDistance} miles`);
        setDuration(durationText);
        setLoadingRoute(false);

        if (roundedDistance > 200) {
          setExceedsRange(true);
        } else {
          setExceedsRange(false);
        }
      } else {
        console.error('Error fetching directions:', status);
        setLoadingRoute(false);
      }
    }
  );
};

// Function to calculate distance to the driver's location (Phoenix)
export const calculateDistanceToCity = (location, setExceedsRange) => {
  const distanceService = new google.maps.DistanceMatrixService();

  distanceService.getDistanceMatrix(
    {
      origins: [{ lat: 33.4484, lng: -112.074 }], // TODO: set to Phx currently, Add to Admin settings
      destinations: [location],
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        const distanceInMeters = result.rows[0].elements[0].distance.value;
        const distanceInMiles = distanceInMeters * 0.000621371;

        setExceedsRange(distanceInMiles > 200);
      } else {
        console.error('Error calculating distance to city:', status);
      }
    }
  );
};
