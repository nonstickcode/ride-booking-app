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

function HomeContent() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, authAlert, showAlert, setUser } = useAuth(); // Destructure user from useAuth

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user); // Set user state globally
      } else {
        setUser(null); // Clear global user state if not logged in
      }
      setLoading(false); // Done loading
    };

    fetchUser();
  }, [setUser]);

  const openBooking = () => {
    if (user) {
      setShowBookingModal(true);
    } else {
      setShowSignInModal(true); // Open sign-in modal if no user
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
    setShowSignInModal(false); // Close sign-in modal
  };

  const handleSignInComplete = async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setUser(data.session.user); // Set user after successful sign-in
      setShowSignInModal(false); // Close the Sign-In Modal immediately
      setTimeout(() => {
        showAlert('Signed in Successfully!', 'success'); // Show success alert
        setShowBookingModal(true); // Open the Booking Modal
      }, 2000); // 2 seconds delay
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null); // Clear global user state on sign-out
      showAlert('Signed out successfully!', 'error'); // Show red alert for sign-out success
    }
  };

  if (loading) {
    return null; // Show nothing until loading is complete
  }

  return (
    <div
      className="--font-oxygen mx-auto flex max-w-96 flex-col items-center justify-center px-4 text-white"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {authAlert?.message && ( // Check if authAlert exists and has a message
        <div
          className={`fixed left-0 right-0 top-0 z-50 p-4 text-xl text-center text-white ${
            authAlert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {authAlert.message}
        </div>
      )}

      {/* Pass openSignInModal and handleSignOut as props */}
      <HamburgerMenu
        openSignInModal={() => setShowSignInModal(true)}
        onSignOut={handleSignOut}
      />

      <Header />

      <main className="mt-10 flex flex-col items-center space-y-8">
        <RideImage />

        <Button
          className="mb-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
          onClick={openBooking}
        >
          <FaCheckCircle className="mr-2" />
          Book Ride Now
        </Button>
      </main>

      {showBookingModal && <BookingModal onClose={closeBooking} />}
      {showSignInModal && (
        <SignInModal
          onClose={closeSignIn}
          onSignInComplete={handleSignInComplete} // Handle post-sign-in action
        />
      )}

      <footer className="mt-8 text-center">
        <p className="text-lg text-gray-200">or text 310-947-9464</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
