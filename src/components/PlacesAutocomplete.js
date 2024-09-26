import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { FaCrosshairs, FaSpinner } from 'react-icons/fa';

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
    setValue(address, false);  // Set the input field to the selected address
    clearSuggestions();  // Clear the suggestions list

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setSelected({ lat, lng });  // Set selected lat/lng for the parent component
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
          const results = await getGeocode({ location: { lat: latitude, lng: longitude } });
          const address = results[0].formatted_address;
          setValue(address, false);  // Set the input field to the current location's address
          setSelected({ lat: latitude, lng: longitude });
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

  return (
    <div className="flex flex-col mb-6 w-full">
      <label className="text-white mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        {/* Input Field */}
        <Input
          value={value}
          onChange={handleInput}
          disabled={!ready || currentLocationLoading}  // Disable if API isn't ready or loading location
          placeholder="Search for an address"
          className="flex-grow p-2 rounded-lg border border-gray-500 bg-gray-800 text-white"
        />

        {/* Current Location Button */}
        <button
          onClick={handleCurrentLocation}
          className="flex items-center justify-center bg-gray-600 text-white rounded-md hover:bg-blue-800"
          style={{ height: '35px', width: '40px' }}  // Make button square
          disabled={currentLocationLoading}  // Disable when loading
          title="Use current location"  // Tooltip text
        >
          {currentLocationLoading ? (
            <FaSpinner className="animate-spin" />  // Spinner while loading
          ) : (
            <FaCrosshairs />  // Target icon when not loading
          )}
        </button>
      </div>
      {/* Suggestions List */}
      {status === 'OK' && (
        <div className="bg-gray-500 shadow-lg rounded-lg mt-2">
          {data.map(({ place_id, description }) => (
            <div
              key={place_id}
              className="p-2 cursor-pointer hover:bg-gray-800"
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
