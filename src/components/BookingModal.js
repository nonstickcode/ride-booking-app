'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLoadScript } from '@react-google-maps/api';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import PlacesAutocomplete from './PlacesAutocomplete'; // Make sure this is properly imported
import { Button } from '@/components/ui/button';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  calculateRoute,
  calculateDistanceToCity,
} from '@/utils/routeCalculations';
import { calculateCost } from '@/utils/costCalculations';
import supabase from '@/utils/supabaseClient';

// Load Google Maps Places API
const libraries = ['places'];

const BookingModal = ({ onClose }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries, // Make sure to pass libraries here
  });

  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [exceedsRange, setExceedsRange] = useState(false);
  const [user, setUser] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

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
    }
  }, [pickupLocation, dropoffLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const bookingData = {
      date,
      time,
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

  // Ensure the API is loaded before rendering the PlacesAutocomplete component
  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  const cost = distance ? calculateCost(parseFloat(distance)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-sm rounded-lg border border-gray-500 bg-black p-4"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center text-gray-400 transition hover:text-white"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Content */}
        <div className="mx-auto w-full max-w-md rounded-lg p-3 shadow-xl">
          <h2 className="mx-auto mb-5 text-center text-2xl font-bold text-white">
            Book a Ride
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <DatePicker date={date} setDate={setDate} />
            <TimePicker time={time} setTime={setTime} />

            {/* Conditionally render PlacesAutocomplete only after the API is loaded */}
            <PlacesAutocomplete
              setSelected={setPickupLocation}
              label="Pickup Location"
            />
            <PlacesAutocomplete
              setSelected={setDropoffLocation}
              label="Drop-off Location"
            />

            {loadingRoute ? (
              <div className="flex items-center space-x-2">
                <FaSpinner className="animate-spin" />
                <p>Calculating distance and time...</p>
              </div>
            ) : distance && duration && cost !== null ? (
              <>
                <p>Estimated Distance: {distance}</p>
                <p>Estimated Time: {duration}</p>
                <p>Estimated Cost: ${cost}</p>
              </>
            ) : null}

            {exceedsRange && (
              <p className="mb-4 text-xl font-bold text-red-500">
                Driver&apos;s range exceeded.
              </p>
            )}

            {showAlert && (
              <div className="fixed left-0 right-0 top-0 z-50 bg-green-500 p-4 text-center text-white">
                Submission successful! Please await an email response.
              </div>
            )}
            <Button
              type="submit"
              disabled={
                !date ||
                !time ||
                !pickupLocation ||
                !dropoffLocation ||
                exceedsRange ||
                loadingSubmit
              }
              className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
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
