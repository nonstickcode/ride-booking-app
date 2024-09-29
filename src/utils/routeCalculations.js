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
        setDuration(durationText); // Set duration text directly
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
