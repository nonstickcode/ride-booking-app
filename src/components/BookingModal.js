'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLoadScript } from '@react-google-maps/api';
import { DatePicker, TimePicker } from '@/components/DateAndTimePicker';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { Button } from '@/components/ui/button';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  calculateRoute,
  calculateDistanceToCity,
} from '@/utils/routeCalculations';
import { calculateCost } from '@/utils/costCalculations';
import supabase from '@/utils/supabaseClient';

const libraries = ['places'];

// TODO: add these to the Driver Admin later to be configurable
const LEAD_TIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
const OFF_TIME_START = 22; // 10pm
const OFF_TIME_END = 10; // 10am

const BookingModal = ({ onClose }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [isTimeTooSoon, setIsTimeTooSoon] = useState(false);
  const [isTimeInOffRange, setIsTimeInOffRange] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [exceedsRange, setExceedsRange] = useState(false);
  const [user, setUser] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isTimeUnavailable, setIsTimeUnavailable] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setHasSubmitted(false);
    setLoadingSubmit(false);
  }, [onClose]);

  useEffect(() => {
    if (pickupLocation || dropoffLocation) {
      calculateDistanceToCity(
        pickupLocation || dropoffLocation,
        setExceedsRange
      );
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      setLoadingRoute(true);
      calculateRoute(
        pickupLocation,
        dropoffLocation,
        setDistance,
        setDuration,
        setLoadingRoute,
        setExceedsRange
      );
    } else {
      setDistance('');
      setDuration('');
    }
  }, [pickupLocation, dropoffLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // Combine date and time before submission
    const combinedDateTime = combineDateAndTime(date, time);

    console.log(date, time);

    const bookingData = {
      date: combinedDateTime.toISOString(), // Use combined date and time here
      pickupLocation,
      dropoffLocation,
      distance,
      duration,
      cost,
    };

    try {
      const emailResponse = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const emailResult = await emailResponse.json();
      if (emailResult.success) {
        setShowAlert(true);
        setHasSubmitted(true);
        setTimeout(() => {
          setShowAlert(false);
          onClose();
        }, 5000);
      } else {
        console.error('Failed to send email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const cost = distance ? calculateCost(parseFloat(distance)) : null;

  // Helper function to combine date and time
  const combineDateAndTime = (date, time) => {
    const combinedDate = new Date(date);
    combinedDate.setHours(time.getHours());
    combinedDate.setMinutes(time.getMinutes());
    combinedDate.setSeconds(time.getSeconds());
    return combinedDate;
  };

  // Function to format off-hours for user display
  const formatOffHours = (start, end) => {
    const formatHour = (hour) => {
      const period = hour >= 12 ? 'pm' : 'am';
      const hourFormatted = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${hourFormatted}${period}`;
    };

    return `No bookings are available between the hours of ${formatHour(start)} and ${formatHour(end)}.   😴 💤 `;
  };

  // Function to check if time is in off hours
  const isTimeInOffHours = (time) => {
    const hours = time.getHours();
    if (OFF_TIME_START > OFF_TIME_END) {
      // Case for off-hours spanning over midnight, e.g., 10pm to 10am
      return hours >= OFF_TIME_START || hours < OFF_TIME_END;
    }
    return hours >= OFF_TIME_START && hours < OFF_TIME_END;
  };

  // Check if the selected time is too soon or unavailable
  const validateTime = async (selectedTime) => {
    if (!selectedTime) {
      console.error('Time is missing');
      return;
    }

    // Reset all validation flags
    setIsTimeTooSoon(false);
    setIsTimeInOffRange(false);
    setIsTimeUnavailable(false);

    // Combine date and time
    const combinedDateTime = combineDateAndTime(date, selectedTime);

    // Check if the time is in the off-hours
    if (isTimeInOffHours(combinedDateTime)) {
      setIsTimeInOffRange(true);
      return; // Stop further validation if time is in the off-hours range
    }

    if (!date) {
      return; // Skip further checks if date is not yet selected
    }

    // Check if the selected time is too soon (less than 1 hour from now)
    if (new Date().toDateString() === date.toDateString()) {
      const currentTime = new Date();
      const leadTimeLimit = new Date(currentTime.getTime() + LEAD_TIME);
      if (combinedDateTime < leadTimeLimit) {
        setIsTimeTooSoon(true);
        return; // Stop further validation if time is too soon
      }
    }

    setLoadingAvailability(true);

    // Prepare the start and end times for the request (assume 2-hour duration)
    const startTime = combinedDateTime.toISOString();
    const endTime = new Date(
      combinedDateTime.getTime() + 2 * 60 * 60 * 1000
    ).toISOString(); // 2-hour duration

    // Log the prepared start and end times for the API
    console.log('Prepared startTime for API:', startTime);
    console.log('Prepared endTime for API:', endTime);

    // Free/Busy request payload
    const requestBody = {
      timeMin: startTime,
      timeMax: endTime,
      items: [
        {
          id: 'cdc3b858fc4efe2b9b44f7ce7298824cb2c0b58dc68d3b450978aebe0c2f234e@group.calendar.google.com',
        },
      ],
    };

    try {
      const response = await fetch('/api/checkCalendarAvailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', response.status, errorText);
        setIsTimeUnavailable(true);
        return;
      }

      const jsonResponse = await response.json();
      console.log('API Response:', jsonResponse); // Debug the actual API response

      // Access the busy slots directly
      const busySlots = jsonResponse.busySlots || [];

      // Set availability status
      setIsTimeUnavailable(busySlots.length > 0);
    } catch (error) {
      console.error('Error checking calendar availability:', error);
      setIsTimeUnavailable(true);
    } finally {
      setLoadingAvailability(false);
      setHasCheckedAvailability(true); // Mark that the API check has been completed at least once
    }
  };

  // Re-validate whenever time or date changes
  useEffect(() => {
    if (time && date) {
      validateTime(time);
    }
  }, [time, date]);

  const generateGoogleMapsLinkForTrip = () => {
    if (pickupLocation && dropoffLocation) {
      const pickup = `${pickupLocation.lat},${pickupLocation.lng}`;
      const dropoff = `${dropoffLocation.lat},${dropoffLocation.lng}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${pickup}&destination=${dropoff}&travelmode=driving`;
    }
    return '#';
  };

  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="modal-background fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-container relative w-[90vw] max-w-sm p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}
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
        <div className="mx-auto w-full max-w-md p-8 shadow-xl">
          <h2 className="mx-auto mb-2 text-center text-2xl font-bold text-white">
            Book a Ride
          </h2>

          {user?.email && (
            <p className="mb-4 text-center text-lg text-gray-300">
              {user.email}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <DatePicker date={date} setDate={setDate} />

            <hr className="mb-4 border-gray-700" />

            <div>
              <TimePicker time={time} setTime={setTime} />

              {isTimeInOffRange && (
                <p className="text-md mb-3 text-red-500">
                  {formatOffHours(OFF_TIME_START, OFF_TIME_END)}
                </p>
              )}

              {!isTimeInOffRange && isTimeTooSoon && (
                <p className="text-md mb-3 text-red-500">
                  Drive requires at least {LEAD_TIME / (60 * 60 * 1000)} hour
                  lead time before any pick-up can be requested.
                </p>
              )}

              {/* Show loading while checking availability */}
              {!isTimeInOffRange && !isTimeTooSoon && loadingAvailability && (
                <div className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin" />
                  <p>Checking availability...</p>
                </div>
              )}

              {/* Only show available, or unavailable messages after the API check has run */}
              {hasCheckedAvailability && (
                <>
                  {/* If time is available */}
                  {!isTimeInOffRange &&
                    !isTimeTooSoon &&
                    !loadingAvailability &&
                    !isTimeUnavailable && (
                      <p className="text-md mb-1 text-green-500">
                        This Date and Time is currently available.
                      </p>
                    )}

                  {/* If time is unavailable */}
                  {!isTimeInOffRange &&
                    !isTimeTooSoon &&
                    !loadingAvailability &&
                    isTimeUnavailable && (
                      <p className="text-md mb-1 text-red-500">
                        This Date and Time is currently not available. Please choose another Date or Time or both.
                      </p>
                    )}
                </>
              )}
            </div>

            <hr className="mb-4 mt-2 border-gray-700" />

            <PlacesAutocomplete
              setSelected={setPickupLocation}
              label="Pickup:"
            />

            <hr className="mb-4 border-gray-700" />

            <PlacesAutocomplete
              setSelected={setDropoffLocation}
              label="Drop-off:"
            />

            {pickupLocation &&
              dropoffLocation &&
              !loadingRoute &&
              distance &&
              duration &&
              cost !== null && (
                <>
                  <hr className="mb-2 border-gray-700" />
                  <a
                    href={generateGoogleMapsLinkForTrip()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 mt-2 text-blue-500 underline"
                  >
                    View trip on Google Maps
                  </a>
                  <p>Estimated Distance: {distance}</p>
                  <p>Estimated Time: {duration}</p>
                  <p>Estimated Cost: ${cost}</p>
                </>
              )}

            {loadingRoute && (
              <div className="flex items-center space-x-2">
                <FaSpinner className="animate-spin" />
                <p>Calculating distance and time...</p>
              </div>
            )}

            {exceedsRange && (
              <p className="mb-4 text-xl font-bold text-red-500">
                Driver&apos;s range exceeded.
              </p>
            )}

            {showAlert && (
              <div className="fixed left-0 right-0 top-0 z-50 bg-green-500 p-4 text-center text-xl text-white">
                Submission successful! Please await an email or sms response.
              </div>
            )}

            <Button
              type="submit"
              disabled={
                hasSubmitted ||
                !date ||
                !time ||
                !pickupLocation ||
                !dropoffLocation ||
                exceedsRange ||
                loadingSubmit ||
                isTimeTooSoon ||
                isTimeInOffRange ||
                isTimeUnavailable
              }
              variant="green"
              size="md"
              className="mt-4"
              title="Submit Request"
            >
              {loadingSubmit ? (
                <FaSpinner className="mr-2 animate-spin" />
              ) : (
                <FaCheck className="mr-2" />
              )}
              {loadingSubmit ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingModal;
