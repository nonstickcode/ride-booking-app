'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import AuthButtons from '@/components/AuthButtons';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import PlacesAutocomplete from './PlacesAutocomplete';
import { FaSignOutAlt, FaCheck } from 'react-icons/fa';
import { useLoadScript } from '@react-google-maps/api';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Load Google Maps API
const libraries = ['places'];

const BookingForm = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,  // Your Google Maps API Key
    libraries,  // Ensure the "places" library is loaded
  });

  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = { date, time, pickupLocation, dropoffLocation };
    console.log('Booking Data:', bookingData);
  };

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-black p-3 shadow-xl">
      <h2 className="mb-8 text-center text-2xl font-bold text-white">
        {user ? 'Book a Ride' : 'Sign in to book a ride'}
      </h2>

      {!user ? (
        <AuthButtons />
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Date Picker */}
          <DatePicker date={date} setDate={setDate} />

          {/* Time Picker */}
          <TimePicker time={time} setTime={setTime} />

          {/* Pickup Location */}
          <PlacesAutocomplete setSelected={setPickupLocation} label="Pickup Location" />

          {/* Drop-off Location */}
          <PlacesAutocomplete setSelected={setDropoffLocation} label="Drop-off Location" />

          {/* Submit Button */}
          <Button
            type="submit"
            className="mb-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
          >
            <FaCheck className="mr-2" /> Submit
          </Button>
          <Button
            onClick={() => supabase.auth.signOut()}
            className="w-full rounded-lg bg-red-600 p-3 text-lg text-white shadow-md hover:bg-red-700"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </Button>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
