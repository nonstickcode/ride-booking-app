'use client';

import {
  SessionContextProvider,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import supabaseClient from '@/utils/supabaseClient'; // Import the singleton client
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/modals/BookingModal';
import SignInModal from '@/components/modals/SignInModal';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaCheckCircle } from 'react-icons/fa';
import Head from 'next/head';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import AdminDecisionModal from '@/components/modals/AdminDecisionModal';

function HomeContent() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showAdminDecisionModal, setShowAdminDecisionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const session = useSession(); // Supabase session hook to get the current user session
  const supabase = useSupabaseClient(); // Supabase client for authentication and data fetching
  const user = session?.user; // Extract the user from the session

  // State to manage alerts for sign-in/sign-out events
  const [authAlert, setAuthAlert] = useState(null);

  // Admin check state
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle decisions update
  const searchParams = useSearchParams();
  const decisionId = searchParams.get('decisionId'); // Extract the decisionId from the query params

  // Consistently check session status and modals based on sign-in state
  useEffect(() => {
    const handleSessionChange = () => {
      if (decisionId && user) {
        setShowAdminDecisionModal(true); // Open the Admin Decision Modal if user is logged in and decisionId is present
        setShowSignInModal(false); // Ensure SignInModal is closed
      } else if (decisionId && !user) {
        setShowSignInModal(true); // Show the SignInModal if no user is logged in
        setShowAdminDecisionModal(false); // Ensure the Admin Decision Modal is closed if not signed in
      } else if (!decisionId && !user) {
        setShowSignInModal(true); // Show SignInModal for other interactions when user is not logged in
      } else {
        setShowSignInModal(false); // Close SignInModal once signed in
      }
    };

    // Call the function initially and on session changes
    handleSessionChange();
  }, [user, decisionId]);

  // Monitor session changes and handle admin check
  useEffect(() => {
    if (session && user) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(user.email === adminEmail);
      setAuthAlert({ message: 'Signed in successfully!', type: 'success' });
    } else if (session && !user) {
      setAuthAlert({ message: 'Signed out successfully!', type: 'error' });
    }

    const alertTimeout = setTimeout(() => setAuthAlert(null), 3000);
    return () => clearTimeout(alertTimeout);
  }, [user, session]);

  // Stop loading after checking session
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  // Handle showing the booking modal or sign-in modal
  const openBooking = () => {
    if (user) {
      setShowBookingModal(true);
    } else {
      setShowSignInModal(true);
    }
  };

  // Close booking modal
  const closeBooking = (e) => {
    if (e) e.stopPropagation();
    setShowBookingModal(false);
  };

  // Close sign-in modal
  const closeSignIn = (e) => {
    if (e) e.stopPropagation();
    setShowSignInModal(false);
  };

  // Handle completion of sign-in
  const handleSignInComplete = async () => {
    setShowSignInModal(false); // Close the sign-in modal

    // After sign-in, check if decisionId is present to open the AdminDecisionModal
    if (decisionId) {
      setShowAdminDecisionModal(true); // Open decision modal if decisionId is in the query params
    } else {
      setShowBookingModal(false); // Otherwise close the booking modal
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
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
          isAdmin={isAdmin}
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

        {/* Show Admin Decision Modal if decisionId exists and modal is triggered */}
        {showAdminDecisionModal && (
          <AdminDecisionModal
            decisionId={decisionId}
            onClose={() => setShowAdminDecisionModal(false)} // Close modal when done
          />
        )}

        {/* Show Booking Modal */}
        {showBookingModal && <BookingModal onClose={closeBooking} />}

        {/* Show Sign In Modal */}
        {showSignInModal && (
          <SignInModal
            onClose={closeSignIn}
            onSignInComplete={handleSignInComplete} // Pass the sign-in complete handler
            bookingId={decisionId} // Pass decisionId (optional)
          />
        )}

        <footer className="mt-8 text-center">
          <p className="text-lg text-gray-200">or text 310-947-9464</p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const handleLoad = () => {
    console.log('Google Maps API is fully loaded and ready to use.');
  };

  return (
    <>
      <Head>
        <meta name="theme-color" content="#000000" />
      </Head>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
        async
        defer
        onLoad={handleLoad}
      />

      <SessionContextProvider supabaseClient={supabaseClient}>
        <HomeContent />
      </SessionContextProvider>
    </>
  );
}
