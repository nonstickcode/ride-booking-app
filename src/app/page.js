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

  // Handle sign-in complete event
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
      setUser(null); // Clear global user state on sign-out
      showAlert('Signed out successfully!', 'error'); // Show red alert for sign-out success
    }
  };

  // Function to send a test SMS
  const sendTestSMS = async () => {
    try {
      const response = await fetch('/api/sendSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: '14805220108', // Replace with the test recipient phone number
          content: 'This is a test SMS from RYDEBLK.', // Test message content
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Test SMS sent successfully!');
      } else {
        alert(`Failed to send SMS: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS.');
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
          variant="blue" // Use blue as the default primary color
          size="lg" // Large size for emphasis
          className="mb-6"
          title="Book Ride Now"
        >
          <FaCheckCircle className="mr-2" />
          Book Ride Now
        </Button>

        {/* Test SMS button */}
        {/* <Button
          onClick={sendTestSMS}
          variant="green" // Green for success
          size="md"
          className="mt-4"
        >
          Send Test SMS
        </Button> */}
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
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
