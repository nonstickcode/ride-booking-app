import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';

const PlacesAutocomplete = ({ setSelected, label }) => {
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

  return (
    <div className="flex flex-col mb-6 w-full">
      <label className="text-white mb-2">{label}</label>
      <Input
        value={value}
        onChange={handleInput}
        disabled={!ready}
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
    </div>
  );
};

export default PlacesAutocomplete;
