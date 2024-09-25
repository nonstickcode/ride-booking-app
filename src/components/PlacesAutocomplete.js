import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';

const PlacesAutocomplete = ({ setSelected, label }) => {
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false); // For loading state
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setSelected({ lat, lng });
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // Get current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setCurrentLocationLoading(true); // Start loading state

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const results = await getGeocode({ location: { lat: latitude, lng: longitude } });
          const address = results[0].formatted_address;
          setValue(address, false);
          setSelected({ lat: latitude, lng: longitude });
        } catch (error) {
          console.error("Error fetching location:", error);
        }
        setCurrentLocationLoading(false); // End loading state
      },
      (error) => {
        console.error("Error getting current location:", error);
        setCurrentLocationLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col border border-gray-600 rounded-md p-2 mb-6 w-full">
      <label className="text-white mb-2">{label}</label>
      <Input
        value={value}
        onChange={handleInput}
        disabled={!ready || currentLocationLoading}  // Disable if API isn't ready or loading location
        placeholder="Search for an address"
        className="w-full p-2 rounded-lg border border-gray-500 bg-gray-800 text-white"
      />
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
      {/* Current Location Button */}
      <button
        onClick={handleCurrentLocation}
        className="mt-2 mx-auto w-fit px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-blue-800"
        disabled={currentLocationLoading}  // Disable when loading
      >
        {currentLocationLoading ? "Getting Location..." : "Use Current Location"}
      </button>
    </div>
  );
};

export default PlacesAutocomplete;
