'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaGoogle, FaEnvelope, FaSignOutAlt, FaCheck } from 'react-icons/fa';

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
      <h2 className="mb-8 text-center text-2xl font-bold text-white">
        {user ? 'Book a Ride' : 'Sign in to book a ride'}
      </h2>

      {!user ? (
        <>
          {signingInWithEmail ? (
            <>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 w-full rounded-md border bg-white p-3 text-black"
                placeholder="Enter your email"
                required
              />
              {emailSent ? (
                <p className="text-white">
                  Check your email for the sign-in link.
                </p>
              ) : (
                <Button
                  onClick={handleEmailSignIn}
                  className="mb-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-3 text-lg font-semibold text-white shadow-md hover:bg-gradient-to-l"
                >
                  <FaEnvelope className="mr-2" /> Send Sign-in Link
                </Button>
              )}
              <Button
                onClick={() => setSigningInWithEmail(false)}
                className="mb-6 w-full rounded-lg bg-gray-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700"
              >
                Use Google Sign In
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleGoogleSignIn}
                className="mb-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-3 text-lg font-semibold text-white shadow-md hover:bg-gradient-to-l"
              >
                <FaGoogle className="mr-2" /> Sign in with Google
              </Button>
              {/* Line break with 'or' in the middle */}
              <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-gray-500"></div>
                <span className="mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-500"></div>
              </div>
              <Button
                onClick={() => setSigningInWithEmail(true)}
                className="my-2 w-full rounded-lg bg-gray-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700"
              >
                <FaEnvelope className="mr-2" /> Sign in with Email
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 text-center text-white">
            <p className="mb-2 text-lg">Welcome, {name} 👋</p>
            <p className="text-md mb-4">{email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Date Picker */}
            <div className="mb-6 w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start border border-gray-500 bg-gray-800 text-left font-normal text-white',
                      !date && 'text-gray-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto rounded-md bg-white p-2 shadow-lg">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="mb-6 w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start border border-gray-500 bg-gray-800 text-left font-normal text-white',
                      !time && 'text-gray-500'
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {time ? time : <span>Pick a Time</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 rounded-md bg-white p-2 shadow-lg">
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="flex w-full justify-between rounded-md border bg-white p-2 text-2xl text-black"
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>

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
