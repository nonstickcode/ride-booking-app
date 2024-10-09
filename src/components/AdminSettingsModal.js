'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

// TODO: need to fix google maps api init to happen earlier (async loading) in home component so LocationsPickers and AdminSettings can both use

const AdminSettingsModal = ({ onClose }) => {
  const [settings, setSettings] = useState({
    home_location_text: '',
    home_location_latitude: '',
    home_location_longitude: '',
    timeoff_start_time: '',
    timeoff_end_time: '',
    lead_time_hours: 0,
    lead_time_minutes: 0,
  });
  const [newSettings, setNewSettings] = useState(settings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const supabase = useSupabaseClient();

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
  });

  // Handle input changes and update the newSettings state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSelect = async (address) => {
    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setNewSettings((prev) => ({
      ...prev,
      home_location_text: address,
      home_location_latitude: lat,
      home_location_longitude: lng,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true); // Disable button during saving process

    const { error } = await supabase.from('AdminSettings').upsert([
      {
        id: settings.id, // Target the row using its unique ID
        home_location_text: newSettings.home_location_text,
        home_location_latitude: newSettings.home_location_latitude,
        home_location_longitude: newSettings.home_location_longitude,
        timeoff_start_time: newSettings.timeoff_start_time,
        timeoff_end_time: newSettings.timeoff_end_time,
        lead_time_hours: parseInt(newSettings.lead_time_hours, 10),
        lead_time_minutes: parseInt(newSettings.lead_time_minutes, 10),
        updated_at: new Date().toISOString(),
      },
    ]);

    setIsSaving(false);

    if (error) {
      setAlertMessage('Failed to save settings. Please try again.');
      setAlertType('error');

      // Hide the alert after 3 seconds
      setTimeout(() => {
        setAlertMessage('');
        setAlertType('');
      }, 3000);
    } else {
      setSettings(newSettings); // Reflect the new data in the component state
      setAlertMessage('Settings saved successfully!');
      setAlertType('success'); // Set alert type to success

      // Hide the alert after 3 seconds
      setTimeout(() => {
        setAlertMessage('');
        setAlertType('');
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('AdminSettings')
        .select('*')
        .limit(1)
        .single(); // Fetch the first row, assuming there's only one row (only one row always)

      if (error) {
        console.error('Error fetching settings:', error);
        setAlertMessage('Failed to load settings. Please try again.');
        setAlertType('error'); // Display error in alert
      } else {
        setSettings(data); // Save the fetched settings
        setNewSettings(data); // Initialize newSettings with fetched data
      }

      setLoading(false);
    };

    fetchSettings();
  }, [supabase]);

  // When loading, return nothing
  if (loading) return null;

  return (
    <div
      className="modal-background fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-container relative w-[90vw] max-w-sm p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
      >
        {/* Alert */}
        {alertMessage && (
          <div
            className={`fixed left-0 right-0 top-0 z-50 p-4 text-center text-2xl text-white ${
              alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {alertMessage}
          </div>
        )}

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="close"
          size="icon"
          className="absolute right-1 top-1"
          aria-label="Close"
          title="Close window"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Modal Content */}
        <div className="mx-auto w-full max-w-md p-8">
          <h2 className="mx-auto mb-4 text-center text-2xl font-bold text-white">
            ADMIN Settings
          </h2>

          <hr className="mb-4 border-gray-700" />

          {/* Form for settings */}
          <div className="mb-4 text-white">
            <label className="mb-2 block">Current Location: </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!ready}
              placeholder={newSettings.home_location_text}
              className="mb-4 w-full rounded p-2 text-black"
            />
            {/* Suggestions dropdown */}
            {status === 'OK' &&
              data.map(({ place_id, description }) => (
                <div
                  key={place_id} // Ensure the key is unique for each child
                  onClick={() => {
                    setValue(description, false);
                    clearSuggestions();
                    handleSelect(description);
                  }}
                  className="cursor-pointer"
                >
                  {description}
                </div>
              ))}

            <hr className="mb-2 border-gray-700" />

            <label className="mb-2 block">Off Hours Start: </label>
            <input
              type="time"
              name="timeoff_start_time"
              value={newSettings.timeoff_start_time}
              onChange={handleInputChange}
              className="mb-4 w-full rounded p-2 text-black"
            />
            <p className="mb-2 text-center text-xs text-white">
              * All bookings blocked in between start and end
            </p>

            <label className="mb-2 block">Off Hours End: </label>
            <input
              type="time"
              name="timeoff_end_time"
              value={newSettings.timeoff_end_time}
              onChange={handleInputChange}
              className="mb-2 w-full rounded p-2 text-black"
            />
          </div>

          <hr className="mb-4 border-gray-700" />

          <label className="mb-2 block">Required Lead Time: </label>
          <div className="flex gap-6">
            <div>
              <label className="mb-1 block">Hours</label>
              <input
                type="number"
                name="lead_time_hours"
                value={newSettings.lead_time_hours || 0}
                onChange={handleInputChange}
                className="w-full rounded p-2 text-black"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block">Minutes</label>
              <input
                type="number"
                name="lead_time_minutes"
                value={newSettings.lead_time_minutes || 0}
                onChange={handleInputChange}
                className="w-full rounded p-2 text-black"
              />
            </div>
          </div>

          <hr className="mb-4 border-gray-700" />

          <p>more here</p>

          <hr className="mb-4 border-gray-700" />

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            variant="green"
            size="md"
            className="w-full"
            title="Save Settings"
            disabled={isSaving} // Disable button when saving
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
