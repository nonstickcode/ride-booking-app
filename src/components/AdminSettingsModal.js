'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const AdminSettingsModal = ({ onClose }) => {
  const [settings, setSettings] = useState({
    home_location_text: '',
    home_location_latitude: '',
    home_location_longitude: '',
    timeoff_start_time: '',
    timeoff_end_time: '',
  });
  const [newSettings, setNewSettings] = useState(settings); // To track input changes
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Manage save button
  const [error, setError] = useState(null); // To display any errors
  const supabase = useSupabaseClient();

  // Handle input changes and update the newSettings state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true); // Disable button during saving process
    setError(null); // Clear any previous errors

    // Save new settings to the database (use upsert to overwrite the single row)
    const { error } = await supabase.from('AdminSettings').upsert([
      {
        id: settings.id, // Target the row using its unique ID
        home_location_text: newSettings.home_location_text,
        home_location_latitude: newSettings.home_location_latitude,
        home_location_longitude: newSettings.home_location_longitude,
        timeoff_start_time: newSettings.timeoff_start_time,
        timeoff_end_time: newSettings.timeoff_end_time,
        updated_at: new Date().toISOString(), // Ensure the 'updated_at' field is updated
      },
    ]);

    setIsSaving(false);

    if (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.'); // Set error message for UI
    } else {
      setSettings(newSettings); // Reflect the new data in the component state
      console.log('Settings saved successfully');
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setError(null); // Clear any errors before fetching
      const { data, error } = await supabase
        .from('AdminSettings')
        .select('*')
        .limit(1)
        .single(); // Fetch the first row, assuming there's only one row

      if (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.'); // Display error in UI
      } else {
        setSettings(data); // Save the fetched settings
        setNewSettings(data); // Initialize newSettings with fetched data
      }

      setLoading(false);
    };

    fetchSettings();
  }, [supabase]);

  if (loading) return <p>Loading...</p>;

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
            {error && <p className="text-red-500">{error}</p>}{' '}
            {/* Display error */}
            {/* Current and input for Home Location */}
              <label className="mb-2 block">Current Location: </label>
            <input
              type="text"
              name="home_location_text"
              value={newSettings.home_location_text}
              onChange={handleInputChange}
              className="mb-4 w-full rounded p-2 text-black"
            />
            <hr className="mb-2 border-gray-700" />

            {/* <label className="mb-2 block">Home Latitude: </label>
            <input
              type="number"
              name="home_location_latitude"
              value={newSettings.home_location_latitude}
              onChange={handleInputChange}
              className="mb-4 w-full rounded p-2 text-black"
            />
            <label className="mb-2 block">Home Longitude: </label>
            <input
              type="number"
              name="home_location_longitude"
              value={newSettings.home_location_longitude}
              onChange={handleInputChange}
              className="mb-4 w-full rounded p-2 text-black"
            /> */}

            {/* Current and input for Time Off Start */}
            <label className="mb-2 block">Off Hours Start: </label>
            <input
              type="time"
              name="timeoff_start_time"
              value={newSettings.timeoff_start_time}
              onChange={handleInputChange}
              className="mb-4 w-full rounded p-2 text-black"
            />
            <p className='text-xs mb-2 text-green-500 text-center'> * All bookings blocked in between start and end</p>
            {/* Current and input for Time Off End */}
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

          {/* Show updated settings */}
          {/* <div className="mt-4 text-white">
            <p>Updated Home Location: {settings?.home_location_text}</p>
            <p>Updated Time Off Start: {settings?.timeoff_start_time}</p>
            <p>Updated Time Off End: {settings?.timeoff_end_time}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
