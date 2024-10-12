'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import ClockIcon from '@mui/icons-material/AccessTime';
import { FaSpinner } from 'react-icons/fa';
import { MyLocationSharp } from '@mui/icons-material';

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
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
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

          // Set the address value in the input
          setValue(address, false);

          // Update newSettings with the current location data
          setNewSettings((prev) => ({
            ...prev,
            home_location_text: address,
            home_location_latitude: latitude,
            home_location_longitude: longitude,
          }));
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
  // Save updated settings
  const handleSaveSettings = async () => {
    setIsSaving(true);

    try {
      let home_location_timezone = null;

      // Check if latitude and longitude have changed and call the /api/timezone route if needed
      if (
        newSettings.home_location_latitude !==
          initialSettings.home_location_latitude ||
        newSettings.home_location_longitude !==
          initialSettings.home_location_longitude
      ) {
        const timezoneResponse = await fetch('/api/timezone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lat: newSettings.home_location_latitude,
            lng: newSettings.home_location_longitude,
          }),
        });

        const timezoneData = await timezoneResponse.json();
        if (!timezoneResponse.ok) {
          throw new Error(timezoneData.error || 'Failed to fetch timezone');
        }
        home_location_timezone = timezoneData.timezone; // Store the returned timezone
      }

      // Upsert the settings to Supabase, including the new timezone if we fetched it
      const { error } = await supabase.from('AdminSettings').upsert([
        {
          id: settings.id,
          home_location_text: newSettings.home_location_text,
          home_location_latitude: newSettings.home_location_latitude,
          home_location_longitude: newSettings.home_location_longitude,
          home_location_timezone:
            home_location_timezone || settings.home_location_timezone, // Use the new timezone if fetched, otherwise the old one
          timeoff_start_time: newSettings.timeoff_start_time,
          timeoff_end_time: newSettings.timeoff_end_time,
          lead_time_hours: parseInt(newSettings.lead_time_hours, 10),
          lead_time_minutes: parseInt(newSettings.lead_time_minutes, 10),
          cost_per_mile_rate: parseFloat(newSettings.cost_per_mile_rate),
          cost_trip_surcharge: parseFloat(newSettings.cost_trip_surcharge),
          misc_range_limit_miles: parseFloat(
            newSettings.misc_range_limit_miles
          ),
          misc_advance_booking_limit_months: parseInt(
            newSettings.misc_advance_booking_limit_months,
            10
          ),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error('Failed to save settings');
      }

      setSettings(newSettings);
      setInitialSettings(newSettings); // Update initial settings to saved values

      // Update button to show "Save Complete"
      setAlertMessage('Settings saved successfully!');
      setAlertType('success');
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlertMessage(error.message || 'Failed to save settings');
      setAlertType('error');
    } finally {
      // Set button text to "Save Complete"
      setTimeout(() => {
        setAlertMessage('');
        setAlertType('');
        setIsSaving(false); // Revert to normal button after save is complete
      }, 2000); // Delay before reverting back to normal button
    }
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
        className="modal-container relative max-h-[95vh] w-[90vw] max-w-sm overflow-y-auto p-4 shadow-xl lg:max-h-[100vh]"
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
        <div className="mx-auto w-full max-w-md p-4">
          <h2 className="mx-auto mb-3 text-center font-mono text-2xl font-bold text-red-500">
            ADMIN SETTINGS
          </h2>

          <hr className="my-2 border-gray-700" />

          {/* Location Input */}
          <div className="text-white">
            <div className="">
              <label className="mb-2 block text-lg font-bold text-blue-200">
                Home Location:
              </label>

              {/* Flex container for input and button */}
              <div className="flex items-center gap-2">
                {' '}
                {/* Use flex and gap for horizontal alignment */}
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
                {/* Current Location Button */}
                <Button
                  onClick={handleCurrentLocation}
                  variant="location"
                  size="smallIcon"
                  disabled={currentLocationLoading}
                  title="Use current location"
                >
                  {currentLocationLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <MyLocationSharp className="" />
                  )}
                </Button>
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
          </div>

          <hr className="my-2 border-gray-700" />

          {/* Non-Working Hours Inputs */}
          <label className="mb-2 block text-lg font-bold text-blue-200">
            Non-Working Hours:
          </label>

          <div className="flex flex-col gap-2">
            {/* Start Time Input */}
            <div className="relative w-full">
              <label className="mb-1 block text-sm">Start Time</label>{' '}
              {/* Ensure label is on top */}
              <div className="relative w-full">
                <input
                  type="time"
                  name="timeoff_start_time"
                  value={newSettings.timeoff_start_time}
                  onChange={handleInputChange}
                  className={`w-full pr-10 ${getInputClass(
                    newSettings.timeoff_start_time,
                    initialSettings.timeoff_start_time
                  )}`} // Add padding for the icon
                  style={{
                    appearance: 'none', // Hide default time picker icon for all browsers
                    WebkitAppearance: 'none', // Hide default icon on WebKit browsers
                    MozAppearance: 'textfield', // Hide default icon on Firefox
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
                {/* Custom Clock Icon (adjusted to overlay on the default one) */}
                <ClockIcon
                  style={{
                    position: 'absolute',
                    right: '16px', // Move the icon slightly to the left to cover the default one
                    top: '50%', // Center icon vertically
                    transform: 'translateY(-50%)', // Ensure proper centering
                    color: 'white', // Icon color
                    pointerEvents: 'none', // Avoid interference with input
                    zIndex: 2,
                  }}
                />
              </div>
            </div>

            <p className="mb-0 text-sm text-gray-400">
              * All bookings blocked in this window
            </p>

            {/* End Time Input */}
            <div className="relative w-full">
              <label className="mb-1 block text-sm">End Time</label>{' '}
              {/* Ensure label is on top */}
              <div className="relative w-full">
                <input
                  type="time"
                  name="timeoff_end_time"
                  value={newSettings.timeoff_end_time}
                  onChange={handleInputChange}
                  className={`w-full pr-10 ${getInputClass(
                    newSettings.timeoff_end_time,
                    initialSettings.timeoff_end_time
                  )}`} // Add padding for the icon
                  style={{
                    appearance: 'none', // Hide default time picker icon for all browsers
                    WebkitAppearance: 'none', // Hide default icon on WebKit browsers
                    MozAppearance: 'textfield', // Hide default icon on Firefox
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
                {/* Custom Clock Icon (adjusted to overlay on the default one) */}
                <ClockIcon
                  style={{
                    position: 'absolute',
                    right: '16px', // Move the icon slightly to the left to cover the default one
                    top: '50%', // Center icon vertically
                    transform: 'translateY(-50%)', // Ensure proper centering
                    color: 'white', // Icon color
                    pointerEvents: 'none', // Avoid interference with input
                    zIndex: 2,
                  }}
                />
              </div>
            </div>
          </div>

          <hr className="my-2 border-gray-700" />

          {/* Lead Time Inputs */}
          <label className="mb-2 block text-lg font-bold text-blue-200">
            Required Lead Time:{' '}
          </label>
          <div className="flex gap-4">
            <div>
              <label className="mb-1 block text-sm">Hours</label>
              <input
                type="number"
                inputMode="numeric" // Ensures numeric keypad
                pattern="[0-9]*" // Fallback for iOS devices
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
              <label className="mb-1 block text-sm">Minutes</label>
              <input
                type="number"
                inputMode="numeric" // Ensures numeric keypad
                pattern="[0-9]*" // Fallback for iOS devices
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

          <hr className="my-2 border-gray-700" />

          {/* Cost Settings Inputs */}
          <label className="mb-2 block text-lg font-bold text-blue-200">
            Ride Pricing:{' '}
          </label>
          <div className="flex gap-4">
            <div className="w-full">
              <label className="mb-1 block text-sm">Per Mile Rate ($)</label>
              <input
                type="number"
                inputMode="numeric" // Ensures numeric keypad
                pattern="[0-9]*" // Fallback for iOS devices
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
              <label className="mb-1 block text-sm">Trip Surcharge ($)</label>
              <input
                type="number"
                inputMode="numeric" // Ensures numeric keypad
                pattern="[0-9]*" // Fallback for iOS devices
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

          <hr className="my-2 border-gray-700" />

          {/* Miscellaneous */}
          <label className="mb-2 block text-lg font-bold text-blue-200">
            Max Limits:
          </label>
          <div className="flex gap-4">
            <div className="w-full">
              <label className="mb-1 block text-sm">
                Range Limit from Home (miles)
              </label>
              <input
                type="number"
                inputMode="numeric" // Ensures numeric keypad
                pattern="[0-9]*" // Fallback for iOS devices
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
              <label className="mb-1 block text-sm">
                Advanced Booking Limit (months)
              </label>
              <input
                type="number"
                inputMode="numeric" // Ensures numeric keypad
                pattern="[0-9]*" // Fallback for iOS devices
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

          <hr className="my-2 border-gray-700" />

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            variant="green"
            size="md"
            className="w-full"
            title={
              isSaving
                ? alertMessage
                  ? 'Save Complete'
                  : 'Saving...'
                : 'Save Settings'
            }
            disabled={isSaving}
          >
            {isSaving ? (
              alertMessage ? (
                'Save Complete'
              ) : (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Saving...
                </>
              )
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
