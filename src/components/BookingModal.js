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

const BookingModal = ({ onClose }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Separate states for date and time
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
    } else {
      // Reset the distance, time, and cost when either location is not provided
      setDistance('');
      setDuration('');
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
      console.log('Booking Request Email Sent to Jamie Successfully!');
    }
  };

  const cost = distance ? calculateCost(parseFloat(distance)) : null;

  // Generate Google Maps link for the trip
  const generateGoogleMapsLinkForTrip = () => {
    if (pickupLocation && dropoffLocation) {
      const pickup = `${pickupLocation.lat},${pickupLocation.lng}`;
      const dropoff = `${dropoffLocation.lat},${dropoffLocation.lng}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${pickup}&destination=${dropoff}&travelmode=driving`;
    }
    return '#';
  };

  // Handle loading or error states
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
        className="modal-container relative w-[90vw] max-w-sm p-2"
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

            <TimePicker time={time} setTime={setTime} />

            <hr className="mb-4 border-gray-700" />

            {/* Pickup Location */}
            <PlacesAutocomplete
              setSelected={setPickupLocation}
              label="Pickup:"
            />
            <hr className="mb-4 border-gray-700" />

            {/* Dropoff Location */}
            <PlacesAutocomplete
              setSelected={setDropoffLocation}
              label="Drop-off:"
            />

            {/* Show only when both pickup and drop-off are present */}
            {pickupLocation &&
              dropoffLocation &&
              !loadingRoute &&
              distance &&
              duration &&
              cost !== null && (
                <>
                  <hr className="mb-2 border-gray-700" />
                  {/* Google Maps Trip Link */}
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
                !date ||
                !time ||
                !pickupLocation ||
                !dropoffLocation ||
                exceedsRange ||
                loadingSubmit
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
