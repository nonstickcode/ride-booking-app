// BookingForm.js
'use client';
import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import AuthButtons from '@/components/AuthButtons';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import PlacesAutocomplete from './PlacesAutocomplete';
import { Button } from '@/components/ui/button';
import { FaCheck, FaSpinner, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  calculateRoute,
  calculateDistanceToCity,
} from '@/utils/routeCalculations';
import supabase from '@/utils/supabaseClient';

// Load Google Maps
const libraries = ['places'];

// Framer Motion Variants for smooth animation
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const BookingForm = ({ closeModal, setUserProp }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    else setUser(null);
  };

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
        console.log('Email sent successfully');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          closeModal();
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

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="mx-auto w-fit max-w-md rounded-lg p-3 shadow-xl"
    >
      <h2 className="mx-auto mb-5 text-center text-2xl font-bold text-white">
        {user ? 'Book a Ride' : 'Sign in to Book a Ride'}
      </h2>

      {!user ? (
        <AuthButtons setUser={setUser} />
      ) : (
        <>
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onSubmit={handleSubmit}
          >
            <DatePicker date={date} setDate={setDate} />
            <TimePicker time={time} setTime={setTime} />
            <PlacesAutocomplete
              setSelected={setPickupLocation}
              label="Pickup Location"
            />
            <PlacesAutocomplete
              setSelected={setDropoffLocation}
              label="Drop-off Location"
            />
            {exceedsRange && (
              <p className="mb-4 font-bold text-red-500">
                Driver&apos;s range exceeded.
              </p>
            )}
            <div className="mb-4 text-white">
              {loadingRoute ? (
                <div className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin" />
                  <p>Calculating distance and time...</p>
                </div>
              ) : (
                <>
                  <p>Estimated Distance: {distance}</p>
                  <p>Estimated Time: {duration}</p>
                </>
              )}
            </div>
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
              className="mb-6 w-full rounded-lg bg-gradient-to-r from-green-600 to-green-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
            >
              {loadingSubmit ? (
                <FaSpinner className="mr-2 animate-spin" />
              ) : (
                <FaCheck className="mr-2" />
              )}
              {loadingSubmit ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              onClick={handleSignOut}
              className="mb-1 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
            >
              <FaSignOutAlt className="mr-2" /> Sign Out
            </Button>
          </motion.form>
        </>
      )}
    </motion.div>
  );
};

export default BookingForm;
