'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/BookingModal';
import SignInModal from '@/components/SignInModal';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaCheckCircle } from 'react-icons/fa';
import supabase from '@/utils/supabaseClient';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Head from 'next/head';

function HomeContent() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, authAlert, showAlert, setUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [setUser]);

  const openBooking = () => {
    if (user) {
      setShowBookingModal(true);
    } else {
      setShowSignInModal(true);
    }
  };

  const closeBooking = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowBookingModal(false);
  };

  const closeSignIn = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowSignInModal(false);
  };

  const handleSignInComplete = async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setUser(data.session.user);
      setShowSignInModal(false);
      showAlert('Signed in Successfully!', 'success');
      setShowBookingModal(true);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      showAlert('Signed out successfully!', 'error');
    }
  };

  if (loading) {
    return null; // Show nothing until loading is complete
  }

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

        {showBookingModal && <BookingModal onClose={closeBooking} />}
        {showSignInModal && (
          <SignInModal
            onClose={closeSignIn}
            onSignInComplete={handleSignInComplete}
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
  return (
    <>
      <Head>
        {/* Meta tag to set background color during page load */}
        <meta name="theme-color" content="#000000" /> {/* Black background */}
      </Head>
      <AuthProvider>
        <HomeContent />
      </AuthProvider>
    </>
  );
}
