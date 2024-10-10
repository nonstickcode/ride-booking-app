'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

const AdminSettingsModal = ({ onClose }) => {
  const [settings, setSettings] = useState({
    home_location_text: '',
    home_location_latitude: '',
    home_location_longitude: '',
    timeoff_start_time: '',
    timeoff_end_time: '',
    lead_time_hours: 0,
    lead_time_minutes: 0,
    cost_per_mile_rate: 0,
    cost_trip_surcharge: 0,
    misc_range_limit_miles: 0,
    misc_advance_booking_limit_months: 0,
  });

  const [newSettings, setNewSettings] = useState(settings);
  const [initialSettings, setInitialSettings] = useState(settings); // Store initial settings
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

  // Handle input changes and track changes for styling
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

  // Save updated settings
  const handleSaveSettings = async () => {
    setIsSaving(true);

    const { error } = await supabase.from('AdminSettings').upsert([
      {
        id: settings.id,
        home_location_text: newSettings.home_location_text,
        home_location_latitude: newSettings.home_location_latitude,
        home_location_longitude: newSettings.home_location_longitude,
        timeoff_start_time: newSettings.timeoff_start_time,
        timeoff_end_time: newSettings.timeoff_end_time,
        lead_time_hours: parseInt(newSettings.lead_time_hours, 10),
        lead_time_minutes: parseInt(newSettings.lead_time_minutes, 10),
        cost_per_mile_rate: parseFloat(newSettings.cost_per_mile_rate),
        cost_trip_surcharge: parseFloat(newSettings.cost_trip_surcharge),
        misc_range_limit_miles: parseFloat(newSettings.misc_range_limit_miles),
        misc_advance_booking_limit_months: parseInt(
          newSettings.misc_advance_booking_limit_months,
          10
        ),
        updated_at: new Date().toISOString(),
      },
    ]);

    setIsSaving(false);

    if (error) {
      setAlertMessage('Failed to save settings. Please try again.');
      setAlertType('error');
    } else {
      setSettings(newSettings); // Update current settings
      setInitialSettings(newSettings); // Reset initial settings to saved values
      setAlertMessage('Settings saved successfully!');
      setAlertType('success');
    }

    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 3000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('AdminSettings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        setAlertMessage('Failed to load settings. Please try again.');
        setAlertType('error');
      } else {
        setSettings(data);
        setNewSettings(data);
        setInitialSettings(data); // Set initial settings to current DB values
      }

      setLoading(false);
    };

    fetchSettings();
  }, [supabase]);

  // Helper to apply the correct styles based on whether the field is changed
  const getInputClass = (fieldValue, initialFieldValue) =>
    fieldValue !== initialFieldValue ? 'admin-input changed' : 'admin-input';

  if (loading) return null;

  return (
    <div
      className="modal-background fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-container relative w-[90vw] max-w-sm p-4 shadow-xl"
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
          <h2 className="mx-auto mb-4 text-center font-mono text-2xl font-bold text-red-500">
            ADMIN SETTINGS
          </h2>

          <hr className="my-4 border-gray-700" />

          {/* Location Input */}
          <div className="text-white">
            <label className="mb-2 block text-lg font-bold">
              Home Location:
            </label>
            <div>
              <input
                type="text"
                value={value || newSettings.home_location_text || ''} // Use value or DB value
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder={
                  initialSettings.home_location_text || 'Enter location'
                } // Placeholder from DB
                className={getInputClass(
                  value || newSettings.home_location_text,
                  initialSettings.home_location_text
                )}
              />
            </div>

            {/* Suggestions dropdown */}
            {status === 'OK' && (
              <div className="mt-1 rounded-lg bg-gray-800 text-white shadow-lg">
                {data.map(({ place_id, description }) => (
                  <div
                    key={place_id}
                    onClick={() => {
                      setValue(description, false); // Set selected place value
                      clearSuggestions();
                      handleSelect(description); // Handle lat/lng selection
                    }}
                    className="cursor-pointer p-2 hover:bg-gray-700"
                  >
                    {description}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Non-Working Hours Inputs */}
          <label className="mb-2 block text-lg font-bold">
            Non-Working Hours:
          </label>
          <p className="mb-2 text-sm text-gray-400">
            * All bookings blocked in this window
          </p>
          <div className="flex gap-4">
            <div className="w-full">
              <label className="mb-1 text-sm block">Start Time</label>
              <input
                type="time"
                name="timeoff_start_time"
                value={newSettings.timeoff_start_time}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.timeoff_start_time,
                  initialSettings.timeoff_start_time
                )}
              />
            </div>
            <div className="w-full">
              <label className="mb-1 text-sm  block">End Time</label>
              <input
                type="time"
                name="timeoff_end_time"
                value={newSettings.timeoff_end_time}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.timeoff_end_time,
                  initialSettings.timeoff_end_time
                )}
              />
            </div>
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Lead Time Inputs */}
          <label className="mb-2 block text-lg font-bold">
            Required Lead Time:{' '}
          </label>
          <div className="flex gap-4">
            <div>
              <label className="mb-1 text-sm  block">Hours</label>
              <input
                type="number"
                name="lead_time_hours"
                value={newSettings.lead_time_hours || 0}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.lead_time_hours,
                  initialSettings.lead_time_hours
                )}
              />
            </div>
            <div>
              <label className="mb-1 text-sm  block">Minutes</label>
              <input
                type="number"
                name="lead_time_minutes"
                value={newSettings.lead_time_minutes || 0}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.lead_time_minutes,
                  initialSettings.lead_time_minutes
                )}
              />
            </div>
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Cost Settings Inputs */}
          <label className="mb-2 block text-lg font-bold">Ride Pricing: </label>
          <div className="flex gap-4">
            <div className="w-full">
              <label className="mb-1  text-sm  block">Per Mile Rate ($)</label>
              <input
                type="number"
                name="cost_per_mile_rate"
                value={newSettings.cost_per_mile_rate || 0}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.cost_per_mile_rate,
                  initialSettings.cost_per_mile_rate
                )}
              />
            </div>
            <div className="w-full">
              <label className="mb-1  text-sm  block">Trip Surcharge ($)</label>
              <input
                type="number"
                name="cost_trip_surcharge"
                value={newSettings.cost_trip_surcharge || 0}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.cost_trip_surcharge,
                  initialSettings.cost_trip_surcharge
                )}
              />
            </div>
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Miscellaneous */}
          <label className="mb-2 block text-lg font-bold">Miscellaneous:</label>
          <div className="flex gap-4">
            <div className="w-full">
              <label className="mb-1 text-sm block">
                Range Limit from Home (miles)
              </label>
              <input
                type="number"
                name="misc_range_limit_miles"
                value={newSettings.misc_range_limit_miles || 0}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.misc_range_limit_miles,
                  initialSettings.misc_range_limit_miles
                )}
              />
            </div>
            <div className="w-full">
              <label className="mb-1 text-sm block">
                Advanced Booking Limit (months)
              </label>
              <input
                type="number"
                name="misc_advance_booking_limit_months"
                value={newSettings.misc_advance_booking_limit_months || 0}
                onChange={handleInputChange}
                className={getInputClass(
                  newSettings.misc_advance_booking_limit_months,
                  initialSettings.misc_advance_booking_limit_months
                )}
              />
            </div>
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            variant="green"
            size="md"
            className="w-full"
            title="Save Settings"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
