'use client';

import { SessionContextProvider, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import supabaseClient from '@/utils/supabaseClient'; // Import the singleton client
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/BookingModal';
import SignInModal from '@/components/SignInModal';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaCheckCircle } from 'react-icons/fa';
import Head from 'next/head';
import SendSMSButton from '@/components/SendSMSButton';

function HomeContent() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const session = useSession();  // Supabase session hook to get the current user session
  const supabase = useSupabaseClient(); // Supabase client for authentication and data fetching
  const user = session?.user;  // Extract the user from the session

  // State to manage alerts for sign-in/sign-out events
  const [authAlert, setAuthAlert] = useState(null);

  // Moved shared states here for booking availability
  const [isTimeTooSoon, setIsTimeTooSoon] = useState(false);
  const [isTimeInOffRange, setIsTimeInOffRange] = useState(false);
  const [isTimeUnavailable, setIsTimeUnavailable] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Monitor session changes and trigger alerts for sign-in and sign-out events
  useEffect(() => {
    if (session && user) {
      // User has signed in
      setAuthAlert({ message: 'Signed in successfully!', type: 'success' });
    } else if (session && !user) {
      // User has signed out
      setAuthAlert({ message: 'Signed out successfully!', type: 'error' });
    }

    // Clear the alert after 3 seconds
    const alertTimeout = setTimeout(() => setAuthAlert(null), 3000);
    return () => clearTimeout(alertTimeout);
  }, [user, session]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setLoading(false); // Stop loading after session check
    };

    fetchUser();
  }, [supabase]);

  const openBooking = () => {
    if (user) {
      setShowBookingModal(true);
    } else {
      setShowSignInModal(true);
    }
  };

  const closeBooking = (e) => {
    if (e) e.stopPropagation();
    setShowBookingModal(false);
  };

  const closeSignIn = (e) => {
    if (e) e.stopPropagation();
    setShowSignInModal(false);
  };

  const handleSignInComplete = async () => {
    setShowSignInModal(false);
    setShowBookingModal(true); // Show booking modal after successful sign-in
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      // Show sign-out alert when the user successfully signs out
      setAuthAlert({ message: 'Signed out successfully!', type: 'error' });
    }
  };

  if (loading) {
    return null; // Wait for loading to complete
  }

  return (
    <div className="main-content --font-oxygen min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-96 flex-col items-center justify-center px-4">

        {/* Alert banner for sign-in/sign-out messages */}
        {authAlert?.message && (
          <div
            className={`fixed left-0 right-0 top-0 z-50 p-4 text-center text-2xl text-white ${
              authAlert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {authAlert.message}
          </div>
        )}

        <HamburgerMenu
          openSignInModal={() => setShowSignInModal(true)}
          onSignOut={handleSignOut}
        />

        <Header />

        <main className="mt-10 flex flex-col items-center space-y-8">
          <RideImage />

          <Button
            onClick={openBooking}
            variant="blue"
            size="lg"
            className="mb-6"
            title="Book Ride Now"
          >
            <FaCheckCircle className="mr-2" />
            Book Ride Now
          </Button>
        </main>

        {showBookingModal && (
          <BookingModal
            onClose={closeBooking}
            isTimeTooSoon={isTimeTooSoon}
            setIsTimeTooSoon={setIsTimeTooSoon}
            isTimeInOffRange={isTimeInOffRange}
            setIsTimeInOffRange={setIsTimeInOffRange}
            isTimeUnavailable={isTimeUnavailable}
            setIsTimeUnavailable={setIsTimeUnavailable}
            loadingAvailability={loadingAvailability}
            setLoadingAvailability={setLoadingAvailability}
          />
        )}
        {showSignInModal && (
          <SignInModal
            onClose={closeSignIn}
            onSignInComplete={handleSignInComplete}
          />
        )}

        {/* <SendSMSButton /> */}

        <footer className="mt-8 text-center">
          <p className="text-lg text-gray-200">or text 310-947-9464</p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        {/* Meta tag to set background color during page load */}
        <meta name="theme-color" content="#000000" /> {/* Black background */}
      </Head>

      <SessionContextProvider supabaseClient={supabaseClient}>
        <HomeContent />
      </SessionContextProvider>
    </>
  );
}
