'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DatePicker, TimePicker } from '@/components/DateAndTimePicker';
import LocationPickers from '@/components/LocationPickers';
import { Button } from '@/components/ui/button';
import { FaCheck, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  calculateRoute,
  calculateDistanceToCity,
  calculateCost,
} from '@/utils/routeCalculations';

import supabase from '@/utils/supabaseClient';
import TimeValidation from '@/components/TimeValidation';
import { combineDateAndTime } from '@/utils/dateUtils';

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const combinedDateTime = combineDateAndTime(date, time);

    const bookingData = {
      date: combinedDateTime.toISOString(),
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

              <TimeValidation
                date={date}
                time={time}
                isValidTime={isValidTime}
                setIsValidTime={setIsValidTime}
              />
            </div>

            <hr className="mb-4 mt-2 border-gray-700" />

            <LocationPickers setSelected={setPickupLocation} label="Pickup:" />

            <hr className="mb-4 border-gray-700" />

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
                <FaSpinner className="mr-2 animate-spin font-bold" />
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
