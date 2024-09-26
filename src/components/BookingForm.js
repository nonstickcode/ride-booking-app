'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLoadScript } from '@react-google-maps/api'; // Ensure API is loaded
import { Button } from '@/components/ui/button';
import AuthButtons from '@/components/AuthButtons';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import PlacesAutocomplete from './PlacesAutocomplete';
import { FaSignOutAlt, FaCheck, FaSpinner } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Load Google Maps with the places library
const libraries = ['places'];

// Hardcoded driver locations / TODO: Later set in Admin Panel for Driver
const DRIVER_LOCATION_PHOENIX = { lat: 33.4484, lng: -112.0740 }; // Phoenix, AZ
const DRIVER_LOCATION_LA = { lat: 34.0522, lng: -118.2437 }; // Los Angeles, CA

// Hardcoded driver distance limit / TODO: Later set in Admin Panel for Driver
const DRIVER_RANGE = 200; // 200 miles

// Function to calculate the route between two locations
const calculateRoute = async (origin, destination, setDistance, setDuration, setLoading, setExceedsRange) => {
  const directionsService = new google.maps.DirectionsService();
  console.log('Calculating route...');

  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const distanceText = result.routes[0].legs[0].distance.text;
        const duration = result.routes[0].legs[0].duration.text;
        const distanceInMiles = parseFloat(distanceText);
        
        setDistance(distanceText);
        setDuration(duration);
        setLoading(false);
        console.log('Distance:', distanceInMiles, 'Duration:', duration); // Debugging output

        // Check if the distance exceeds the driver's range (200 miles)
        if (distanceInMiles > DRIVER_RANGE) {
          setExceedsRange(true);
        } else {
          setExceedsRange(false);
        }
      } else {
        console.error('Error fetching directions:', status);
        setLoading(false);
      }
    }
  );
};

// Function to calculate the distance from the driver’s location (Phoenix) to the pickup/drop-off
const calculateDistanceToCity = async (location, setExceedsRange) => {
  const distanceService = new google.maps.DistanceMatrixService();

  distanceService.getDistanceMatrix(
    {
      origins: [{ lat: DRIVER_LOCATION_PHOENIX.lat, lng: DRIVER_LOCATION_PHOENIX.lng }],
      destinations: [location],
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        const distanceInMeters = result.rows[0].elements[0].distance.value;
        const distanceInMiles = distanceInMeters * 0.000621371; // Convert meters to miles

        console.log('Distance to destination (miles):', distanceInMiles); // Debugging output
        if (distanceInMiles > DRIVER_RANGE) {
          setExceedsRange(true);
        } else {
          setExceedsRange(false);
        }
      } else {
        console.error('Error calculating distance to city:', status);
      }
    }
  );
};

const BookingForm = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [exceedsRange, setExceedsRange] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  // Check if the pickup or drop-off location exceeds driver’s range
  useEffect(() => {
    if (pickupLocation || dropoffLocation) {
      calculateDistanceToCity(pickupLocation || dropoffLocation, setExceedsRange);
    }
  }, [pickupLocation, dropoffLocation]);

  // Fetch route details when both locations are set
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      setLoading(true); // Show loading indicator
      calculateRoute(pickupLocation, dropoffLocation, setDistance, setDuration, setLoading, setExceedsRange);
    }
  }, [pickupLocation, dropoffLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = { date, time, pickupLocation, dropoffLocation, distance, duration };
    console.log('Booking Data:', bookingData);
  };

  // Disable submit button if any field is missing or if the distance exceeds the range
  const isFormComplete =
    date && time && pickupLocation && dropoffLocation && !exceedsRange;

  if (!isLoaded) return <div>Loading Google Maps...</div>; // Wait until the API is loaded

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-black p-3 shadow-xl">
      <h2 className="mb-8 text-center text-2xl font-bold text-white">
        {user ? 'Book a Ride' : 'Sign in to book a ride'}
      </h2>

      {!user ? (
        <AuthButtons />
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Date Picker */}
          <DatePicker date={date} setDate={setDate} />

          {/* Time Picker */}
          <TimePicker time={time} setTime={setTime} />

          {/* Pickup Location */}
          <div className="mb-2">
            <PlacesAutocomplete setSelected={setPickupLocation} label="Pickup Location" />
          </div>

          {/* Arrow indicating from pickup to dropoff */}
          <div className="flex justify-center mb-2">
            <FontAwesomeIcon icon={faArrowDown} className="text-white text-xl" />
          </div>

          {/* Drop-off Location */}
          <div className="mb-4">
            <PlacesAutocomplete setSelected={setDropoffLocation} label="Drop-off Location" />
          </div>

          {/* Show an alert if the range exceeds */}
          {exceedsRange && (
            <p className="text-red-500">Driver's range of {DRIVER_RANGE} miles exceeded.</p>
          )}

          {/* Display Distance and Duration */}
          <div className="text-white mb-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <FaSpinner className="animate-spin" />
                <p>Calculating distance and time...</p>
              </div>
            ) : (
              distance && duration && (
                <>
                  <p>Estimated Travel Distance: {distance}</p>
                  <p>Estimated Travel Time: {duration}</p>
                </>
              )
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormComplete}
            className={`mb-6 w-full rounded-lg p-3 text-lg text-white shadow-md transition ${
              isFormComplete
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 hover:bg-gradient-to-l'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            <FaCheck className="mr-2" /> Submit
          </Button>
          <Button
            onClick={() => supabase.auth.signOut()}
            className="w-full rounded-lg bg-red-500 p-3 text-lg font-bold text-white shadow-md hover:bg-red-700"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </Button>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
