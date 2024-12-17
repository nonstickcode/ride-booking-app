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
    if (session && user) {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(user.email === adminEmail);
      setAuthAlert({ message: 'Signed in successfully!', type: 'success' });
    }

    const alertTimeout = setTimeout(() => setAuthAlert(null), 3000);
    return () => clearTimeout(alertTimeout);
  }, [user, session]);

  const openBooking = () => {
    if (user) setShowBookingModal(true);
    else setShowSignInModal(true);
  };

  const closeBooking = (e) => {
    if (e) e.stopPropagation();
    setShowBookingModal(false);
  };

  const closeSignIn = (e) => {
    if (e) e.stopPropagation();
    setShowSignInModal(false);
  };

  const handleSignInComplete = () => {
    setShowSignInModal(false);
    if (bookingId) setShowAdminDecisionModal(true);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error)
      setAuthAlert({ message: 'Signed out successfully!', type: 'error' });
  };

  if (loading) return null; // Loading state

  return (
    <div className="main-content --font-oxygen min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-96 flex-col items-center justify-center px-4">
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

        <footer className="mt-8 text-center">
          <p className="text-lg text-gray-200">or text 310-947-9464</p>
          {/* <a
            href="https://www.youtube.com/@MicDropBBQ"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-gray-200 hover:text-blue-300"
          >
            Check out our recommended YouTube partner
          </a> */}
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
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
        onLoad={() => console.log('Google Maps API loaded')}
      />
      <SessionContextProvider supabaseClient={supabaseClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <HomeContent />
        </Suspense>
      </SessionContextProvider>
    </>
  );
}
