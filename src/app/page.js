'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/BookingModal';
import SignInModal from '@/components/SignInModal'; // Importing the SignInModal
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaCheckCircle } from 'react-icons/fa';
import supabase from '@/utils/supabaseClient';

export default function Home() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false); // Add state for the sign-in modal
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Manage user state here
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      } else {
        setUser(null); // Clear user if not logged in
      }
    };

    fetchUser();

    if (typeof window !== 'undefined') {
      const isBooking = localStorage.getItem('isBooking');

      if (isBooking === 'true') {
        setShowBookingModal(true);
        localStorage.removeItem('isBooking');
      }

      setLoading(false);
    }
  }, []);

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
      setShowSignInModal(false); // Close sign-in modal after successful sign-in
      setShowBookingModal(true);  // Open booking modal after successful sign-in
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    else setUser(null); // Clear user state on sign-out
  };

  if (loading) {
    return null;
  }

  return (
    <div
      className="--font-oxygen flex flex-col max-w-96 mx-auto items-center justify-center px-4 text-white"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {/* Pass openSignInModal and handleSignOut as props */}
      <HamburgerMenu 
        openSignInModal={() => setShowSignInModal(true)} 
        user={user}
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
