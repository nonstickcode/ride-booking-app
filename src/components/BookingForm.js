'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import AuthButtons from '@/components/AuthButtons';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import PlacesAutocomplete from './PlacesAutocomplete';
import { FaSignOutAlt, FaCheck, FaSpinner } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { calculateRoute, calculateDistanceToCity } from '@/utils/routeCalculations';
import { motion } from 'framer-motion'; // Import Framer Motion

// Supabase Initialization
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Load Google Maps
const libraries = ['places'];

// Framer Motion Variants for smooth animation
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const BookingForm = () => {
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
  const [loading, setLoading] = useState(false);
  const [exceedsRange, setExceedsRange] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (pickupLocation || dropoffLocation) {
      calculateDistanceToCity(pickupLocation || dropoffLocation, setExceedsRange);
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      setLoading(true);
      calculateRoute(pickupLocation, dropoffLocation, setDistance, setDuration, setLoading, setExceedsRange);
    }
  }, [pickupLocation, dropoffLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = { date, time, pickupLocation, dropoffLocation, distance, duration };
    console.log('Booking Data:', bookingData);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`, // Redirect back to the home page after login
      },
    });
    if (error) console.error('Error signing in:', error);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    else setUser(null);
  };

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }} // Control animation timing
      className="mx-auto w-full max-w-md rounded-lg bg-black p-3 shadow-xl"
    >
      <h2 className="mb-8 text-center text-2xl font-bold text-white">
        {user ? 'Book a Ride' : 'Sign in to Book a Ride'}
      </h2>

      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <AuthButtons handleGoogleSignIn={handleGoogleSignIn} />
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onSubmit={handleSubmit}
        >
          <DatePicker date={date} setDate={setDate} />
          <TimePicker time={time} setTime={setTime} />

          {/* Pickup & Drop-off */}
          <div className="mb-2">
            <PlacesAutocomplete setSelected={setPickupLocation} label="Pickup Location" />
          </div>
          <div className="flex justify-center mb-2">
            <FontAwesomeIcon icon={faArrowDown} className="text-white text-xl" />
          </div>
          <div className="mb-4">
            <PlacesAutocomplete setSelected={setDropoffLocation} label="Drop-off Location" />
          </div>

          {exceedsRange && <p className="text-red-500 mb-4 font-bold">Driver's range exceeded.</p>}
          <div className="text-white mb-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <FaSpinner className="animate-spin" />
                <p>Calculating distance and time...</p>
              </div>
            ) : (
              distance && duration && (
                <>
                  <p>Estimated Distance: {distance}</p>
                  <p>Estimated Time: {duration}</p>
                </>
              )
            )}
          </div>

          <Button
            type="submit"
            disabled={!date || !time || !pickupLocation || !dropoffLocation || exceedsRange}
            className="mb-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
          >
            <FaCheck className="mr-2" /> Submit Request
          </Button>

          <Button
            onClick={handleSignOut}
            className="w-full rounded-lg bg-red-500 p-3 text-lg font-bold text-white shadow-md hover:bg-red-700"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </Button>
        </motion.form>
      )}
    </motion.div>
  );
};

export default BookingForm;
