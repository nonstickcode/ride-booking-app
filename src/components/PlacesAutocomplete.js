import React, { useState } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { FaCrosshairs, FaSpinner } from 'react-icons/fa';
import { Button } from './ui/button';

const PlacesAutocomplete = ({ setSelected, label }) => {
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300, // Debounce the input for smoother experience
  });

  // Handle input change
  const handleInput = (e) => {
    setValue(e.target.value);
  };

  // Handle selection of an address from the suggestions
  const handleSelect = async (address) => {
    setValue(address, false); // Set the input field to the selected address
    clearSuggestions(); // Clear the suggestions list

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setSelected({ lat, lng, address }); // Set selected lat/lng and address for the parent component
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  // Get the user's current location using Geolocation API
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setCurrentLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const results = await getGeocode({
            location: { lat: latitude, lng: longitude },
          });
          const address = results[0].formatted_address;
          setValue(address, false); // Set the input field to the current location's address
          setSelected({ lat: latitude, lng: longitude, address });
        } catch (error) {
          console.error('Error fetching location:', error);
        }
        setCurrentLocationLoading(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        setCurrentLocationLoading(false);
      }
    );
  };

  // Generate Google Maps link based on the current value in the input field
  const generateGoogleMapsLink = () => {
    if (value) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
    }
    return 'https://www.google.com/maps'; // Open generic Google Maps if no input
  };

  return (
    <div className="mb-6 flex w-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-white">{label}</label>
        <a
          href={generateGoogleMapsLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-300 hover:underline"
        >
          Use Google Maps
        </a>
      </div>

      <div className="flex items-center space-x-2">
        {/* Input Field */}
        <Input
          value={value}
          onChange={handleInput}
          disabled={!ready || currentLocationLoading} // Disable if API isn't ready or loading location
          placeholder="Search for an address"
          className="flex-grow rounded-lg border border-gray-500 bg-gray-800 p-2 text-white"
        />

        {/* Current Location Button */}
        <Button
          onClick={handleCurrentLocation}
          variant="location"
          size="smallIcon" // Use the smallIcon size variant
          disabled={currentLocationLoading}
          title="Use current location"
        >
          {currentLocationLoading ? (
            <FaSpinner className="animate-spin" /> // Spinner while loading
          ) : (
            <FaCrosshairs /> // Target icon when not loading
          )}
        </Button>
      </div>

      {/* Suggestions List */}
      {status === 'OK' && (
        <div className="mt-2 rounded-lg bg-gray-500 shadow-lg">
          {data.map(({ place_id, description }) => (
            <div
              key={place_id}
              className="cursor-pointer p-2 hover:bg-gray-800"
              onClick={() => handleSelect(description)}
            >
              {description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
