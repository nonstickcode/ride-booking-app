'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DatePicker, TimePicker } from '@/components/pickers/DateAndTimePicker';
import LocationPickers from '@/components/pickers/LocationPickers';
import { Button } from '@/components/ui/button';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // UUID generation
import {
  calculateRoute,
  calculateDistanceToCity,
  calculateCost,
} from '@/utils/routeCalculations';
import supabase from '@/utils/supabaseClient';
import TimeValidation from '@/components/TimeValidation';
import { combineDateAndTime } from '@/utils/dateTime';

// Function to fetch admin settings
const getAdminSettings = async () => {
  let { data, error } = await supabase
    .from('AdminSettings')
    .select('misc_range_limit_miles, home_location_text')
    .single();

  return { data, error };
};

// Function to reverse geocode to get city and state
const reverseGeocode = async (address) => {
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK') {
        const result = results[0];
        const city = result.address_components.find((component) =>
          component.types.includes('locality')
        )?.long_name;
        const state = result.address_components.find((component) =>
          component.types.includes('administrative_area_level_1')
        )?.long_name;

        if (city && state) {
          resolve(`${city}, ${state}`);
        } else {
          resolve('LA or PHX'); // Fallback
        }
      } else {
        reject('Geocode failed: ' + status);
      }
    });
  });
};

const BookingModal = ({ onClose }) => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
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
  const [isValidTime, setIsValidTime] = useState(false);
  const [cost, setCost] = useState(null);

  // States for AdminSettings DB values when fetched from Supabase
  const [rangeLimitMiles, setRangeLimitMiles] = useState(0);
  const [homeLocationVisibleToUser, setHomeLocationVisibleToUser] =
    useState(null); // Renamed state variable

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };
    fetchUser();
  }, []);

  // Fetch admin settings when component mounts
  useEffect(() => {
    const fetchAdminSettings = async () => {
      const { data, error } = await getAdminSettings();
      if (!error && data) {
        setRangeLimitMiles(data.misc_range_limit_miles);

        // Reverse geocode the home location to get city and state
        try {
          const cityAndState = await reverseGeocode(data.home_location_text);
          setHomeLocationVisibleToUser(cityAndState);
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);
        }
      } else {
        console.error('Failed to fetch admin settings:', error);
      }
    };

    fetchAdminSettings();
  }, []);

  // Reset form states on close
  useEffect(() => {
    setHasSubmitted(false);
    setLoadingSubmit(false);
  }, [onClose]);

  // Check if location exceeds range
  useEffect(() => {
    if (pickupLocation || dropoffLocation) {
      calculateDistanceToCity(
        pickupLocation || dropoffLocation,
        setExceedsRange
      );
    }
  }, [pickupLocation, dropoffLocation]);

  // Calculate route, distance, and cost when both pickup and dropoff are set
  useEffect(() => {
    const calculateAndSetCost = async () => {
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

        // After calculating the route, calculate the cost
        const distanceInMiles = parseFloat(distance.replace(/[^\d.]/g, ''));
        if (!isNaN(distanceInMiles)) {
          const calculatedCost = await calculateCost(distanceInMiles);
          setCost(calculatedCost);
        }
      } else {
        setDistance('');
        setDuration('');
        setCost(null);
      }
    };

    calculateAndSetCost();
  }, [pickupLocation, dropoffLocation, distance]);

  // Save booking data to Supabase and send email to Driver / Admin / Jamie
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // Combine date and time using Luxon
    const combinedDateTime = combineDateAndTime(date, time);

    const bookingId = uuidv4(); // Generate a new UUID for the booking
    const bookingData = {
      id: bookingId, // UUID
      user_uuid: user.id, // User UUID
      user_email: user.email, // User email
      requestedDateAndTime: combinedDateTime.toISO(), // Save in ISO format for timezonez column
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      distance,
      duration,
      cost,
      status: 'pending', // Default status
    };

    try {
      // Insert booking data into the NewBookingData table
      const { data, error } = await supabase
        .from('NewBookingData')
        .insert([bookingData]);

      if (error) {
        console.error('Error saving booking data:', error);
        return;
      }

      // Send the booking data to the email route
      const emailResponse = await fetch('/api/email/sendRequestEmailToAdmin', {
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

  const generateGoogleMapsLinkForTrip = () => {
    if (pickupLocation && dropoffLocation) {
      const pickup = `${pickupLocation.lat},${pickupLocation.lng}`;
      const dropoff = `${dropoffLocation.lat},${dropoffLocation.lng}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${pickup}&destination=${dropoff}&travelmode=driving`;
    }
    return '#';
  };

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
        className="modal-container relative max-h-[95vh] w-[90vw] max-w-sm overflow-y-auto p-4 shadow-xl lg:max-h-[100vh]"
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
        <div className="mx-auto w-full max-w-md p-8 shadow-xl">
          <h2 className="mx-auto text-center text-2xl font-bold text-white">
            Book a Ride
          </h2>

          {user?.email && (
            <p className="text-center text-lg text-gray-300">{user.email}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {' '}
            {/* Added gap-2 here */}
            <DatePicker date={date} setDate={setDate} />
            <hr className="border-gray-700" />
            <div>
              <TimePicker time={time} setTime={setTime} />

              <TimeValidation
                date={date}
                time={time}
                isValidTime={isValidTime}
                setIsValidTime={setIsValidTime}
              />
            </div>
            <hr className="border-gray-700" />
            <LocationPickers setSelected={setPickupLocation} label="Pickup:" />
            <hr className="border-gray-700" />
            <LocationPickers
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
                  <hr className="border-gray-700" />

                  <a
                    href={generateGoogleMapsLinkForTrip()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View trip on Google Maps
                  </a>
                  <div className="gap-1">
                    <p>Estimated Distance: {distance}</p>
                    <p>Estimated Time: {duration}</p>
                    <p>Estimated Cost: ${cost}</p>
                  </div>
                </>
              )}
            {loadingRoute && (
              <div className="flex items-center space-x-2">
                <FaSpinner className="animate-spin font-bold" />
                <p>Calculating distance and time...</p>
              </div>
            )}
            {exceedsRange && (
              <p className="text-lg font-bold text-red-500">
                Driver&apos;s current Range Limit is {rangeLimitMiles} miles
                from {homeLocationVisibleToUser}
              </p>
            )}
            {showAlert && (
              <div className="fixed left-0 right-0 top-0 z-50 bg-green-500 p-4 text-center text-xl text-white">
                Submission successful! Please await an Email or SMS response.
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
                !isValidTime // Disable if time validation fails
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
