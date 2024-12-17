import React, { useState } from 'react';
import useLocationPickers, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import TextField from '@mui/material/TextField';
import { Button } from '@/components/modifiedUI/button';
import { MyLocationSharp } from '@mui/icons-material';
import { FaSpinner } from 'react-icons/fa';

const LocationPickers = ({ setSelected, label }) => {
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = useLocationPickers({
    debounce: 300, // Debounce the input for smoother experience
  });

  // Handle input change
  const handleInput = (e) => {
    setValue(e.target.value);
  };

  // Handle selection of an address from the suggestions
  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

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
        console.log(
          `Geolocation Success: Latitude: ${latitude}, Longitude: ${longitude}`
        );

        try {
          const results = await getGeocode({
            location: { lat: latitude, lng: longitude },
          });

          if (results && results.length > 0) {
            const address = results[0].formatted_address;
            setValue(address, false);
            setSelected({ lat: latitude, lng: longitude, address });
          } else {
            alert('No address found for the current location.');
          }
        } catch (error) {
          console.error('Error fetching geocode results:', error);
          alert('Failed to fetch address for your location. Please try again.');
        }
        setCurrentLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        setCurrentLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              'Permission to access location was denied. Please allow location permissions in your browser settings.'
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert(
              'Location information is unavailable. Please try again later.'
            );
            break;
          case error.TIMEOUT:
            alert(
              'The request to get your location timed out. Please try again.'
            );
            break;
          default:
            alert('An unknown error occurred while retrieving your location.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
    <div className="w-full">
      <div className="grid grid-cols-1 gap-0">
        {/* Label and Google Maps link */}
        <div className="mb-1 mt-2 flex items-center justify-between">
          <span className="cursor-default text-sm text-white">{label}</span>
          <a
            href={generateGoogleMapsLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-blue-300"
          >
            Use Google Maps
          </a>
        </div>

        {/* Input Field and Button */}
        <div className="flex items-center gap-2">
          <TextField
            value={value}
            onChange={handleInput}
            disabled={!ready || currentLocationLoading}
            placeholder="Search by Name or Address"
            className="flex-grow text-sm"
            autoComplete="off"
          />
          <Button
            onClick={handleCurrentLocation}
            variant="location"
            size="smallIcon"
            disabled={currentLocationLoading}
          >
            {currentLocationLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <MyLocationSharp style={{ fontSize: '20px' }} />
            )}
          </Button>
        </div>

        {/* Suggestions */}
        <div
          className={
            status === 'OK'
              ? 'rounded-lg bg-gray-500 shadow-lg'
              : 'h-0 overflow-hidden'
          }
        >
          {status === 'OK' &&
            data.map(({ place_id, description }) => (
              <div
                key={place_id}
                className="cursor-pointer p-2 text-sm hover:bg-gray-800"
                onClick={() => handleSelect(description)}
              >
                {description}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LocationPickers;
