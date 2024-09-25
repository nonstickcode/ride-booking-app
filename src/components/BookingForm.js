'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import AuthButtons from '@/components/AuthButtons';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import { FaSignOutAlt, FaCheck } from 'react-icons/fa';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BookingForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(null);
  const [user, setUser] = useState(null);
  const [signingInWithEmail, setSigningInWithEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`, // Redirect back to the home page after login
      },
    });
    if (error) console.error('Error signing in:', error);
  };

  // Handle Email Sign In
  const handleEmailSignIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) {
      console.error('Error signing in with email:', error);
    } else {
      setEmailSent(true);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      setName('');
      setEmail('');
    }
  };

  // Fetch session and user data
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setName(session.user.user_metadata.full_name || '');
        setEmail(session.user.email || '');
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = { date, time, name, email };
    console.log('Booking Data:', bookingData);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-black p-3 shadow-xl">
      {/* BookingFormHeader inline component */}
      <h2 className="mb-8 text-center text-2xl font-bold text-white">
        {user ? 'Book a Ride' : 'Sign in to book a ride'}
      </h2>

      {!user ? (
        <AuthButtons
          handleGoogleSignIn={handleGoogleSignIn}
          handleEmailSignIn={handleEmailSignIn}
          signingInWithEmail={signingInWithEmail}
          setSigningInWithEmail={setSigningInWithEmail}
          email={email}
          setEmail={setEmail}
          emailSent={emailSent}
        />
      ) : (
        <>
          {/* UserInfo inline component */}
          <div className="mb-6 text-center text-white">
            <p className="mb-2 text-lg">Welcome, {name} 👋</p>
            <p className="text-md mb-4">{email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Date Picker */}
            <DatePicker date={date} setDate={setDate} />

            {/* Time Picker */}
            <TimePicker time={time} setTime={setTime} />

            {/* Submit Button */}
            <Button
              type="submit"
              className="mb-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
            >
              <FaCheck className="mr-2" /> Submit
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full rounded-lg bg-red-600 p-3 text-lg text-white shadow-md hover:bg-red-700"
            >
              <FaSignOutAlt className="mr-2" /> Sign Out
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default BookingForm;
