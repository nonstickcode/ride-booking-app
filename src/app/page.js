'use client';

export const dynamic = 'force-dynamic';

import {
  SessionContextProvider,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import supabaseClient from '@/utils/supabaseClient';
import { useState, useEffect } from 'react';
import { Button } from '@/components/modifiedUI/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/modals/BookingModal';
import SignInModal from '@/components/modals/SignInModal';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaCheckCircle } from 'react-icons/fa';
import Head from 'next/head';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AdminDecisionModal from '@/components/admin/AdminDecisionModal';

function HomeContent() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showAdminDecisionModal, setShowAdminDecisionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const session = useSession();
  const supabase = useSupabaseClient();
  const user = session?.user;

  const [authAlert, setAuthAlert] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId');

  useEffect(() => {
    const initialize = async () => {
      // Wait for session to load
      const { data } = await supabase.auth.getSession();
      setLoading(false);

      // Check for bookingId and user state
      if (bookingId) {
        if (user) {
          setShowAdminDecisionModal(true);
          setShowSignInModal(false);
        } else {
          setShowSignInModal(true);
        }
      }
    };

    initialize();
  }, [bookingId, user, supabase]);

  useEffect(() => {
    // Check session and user for admin status
    if (session && user) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(user.email === adminEmail);
      setAuthAlert({ message: 'Signed in successfully!', type: 'success' });
    }

    // Hide auth alert after 3 seconds
    const alertTimeout = setTimeout(() => setAuthAlert(null), 3000);
    return () => clearTimeout(alertTimeout);
  }, [user, session]);

  // Function to open booking modal
  const openBooking = () => {
    if (user) setShowBookingModal(true);
    else setShowSignInModal(true);
  };

  // Function to close booking modal
  const closeBooking = (e) => {
    if (e) e.stopPropagation();
    setShowBookingModal(false);
  };

  // Function to close sign-in modal
  const closeSignIn = (e) => {
    if (e) e.stopPropagation();
    setShowSignInModal(false);
  };

  // Callback for successful sign-in
  const handleSignInComplete = () => {
    setShowSignInModal(false);
    if (bookingId) setShowAdminDecisionModal(true);
  };

  // Function to sign out user
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error)
      setAuthAlert({ message: 'Signed out successfully!', type: 'error' });
  };

  if (loading) return null; // Loading state

  return (
    <div className="main-content --font-oxygen min-h-[110vh] text-white">
      <div
        id="hamburger-container"
        className="flex w-full justify-end pr-4 pt-4"
      >
        {/* Hamburger menu */}
        <HamburgerMenu
          openSignInModal={() => setShowSignInModal(true)}
          onSignOut={handleSignOut}
          isAdmin={isAdmin}
        />
      </div>
      <div className="mx-auto flex max-w-96 flex-col items-center justify-center px-4">
        {/* Alert for authentication */}
        {authAlert?.message && (
          <div
            className={`fixed left-0 right-0 top-0 z-50 p-4 text-center text-2xl text-white ${
              authAlert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {authAlert.message}
          </div>
        )}

        <div className="main-content --font-oxygen flex min-h-dvh flex-col text-white">
          {/* Header */}
          <header className="mt-auto flex items-center justify-center pb-8">
            <Header />
          </header>
          {/* Main Content */}
          <main className="flex flex-col items-center justify-center pb-10">
            <RideImage />
            <Button
              onClick={openBooking}
              variant="blue"
              size="lg"
              className="m-6"
              title="Book Ride Now"
            >
              <FaCheckCircle className="mr-2" />
              Book Ride Now
            </Button>
            <p className="text-lg text-gray-300">or text 310-947-9464</p>
          </main>
          {/* Spacer to push footer out of view */}
          <div className="h-25"></div>
          {/* Footer anchored to bottom */}
          <footer className="mt-auto flex flex-shrink-0 items-center justify-center space-x-2 pb-4">
            <a
              href="/site-information"
              className="text-sm font-light text-gray-400 hover:text-gray-200"
            >
              Site Information
            </a>
            <span className="text-sm font-light text-gray-400">/</span>

            <a
              href="/privacy-policy"
              className="text-sm font-light text-gray-400 hover:text-gray-200"
            >
              Privacy Policy
            </a>
          </footer>
        </div>

        {/* Modals */}
        {showAdminDecisionModal && (
          <AdminDecisionModal
            bookingId={bookingId}
            onClose={() => setShowAdminDecisionModal(false)}
          />
        )}
        {showBookingModal && <BookingModal onClose={closeBooking} />}
        {showSignInModal && (
          <SignInModal
            onClose={closeSignIn}
            onSignInComplete={handleSignInComplete}
            bookingId={bookingId}
          />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Meta for theme color */}
      <Head>
        <meta name="theme-color" content="#000000" />
      </Head>
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
        async
        defer
        onLoad={() => console.log('Google Maps API loaded')}
      />
      {/* Supabase session provider */}
      <SessionContextProvider supabaseClient={supabaseClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <HomeContent />
        </Suspense>
      </SessionContextProvider>
    </>
  );
}
