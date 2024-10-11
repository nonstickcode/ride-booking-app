'use client';

import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import SignInModal from '@/components/SignInModal';

const BookingDecisionPage = ({ params }) => {
  const { id } = params; // Get the booking ID from the URL params
  const [booking, setBooking] = useState(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [authAlert, setAuthAlert] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const session = useSession(); // Supabase session hook to get the current user session
  const supabase = useSupabaseClient(); // Supabase client for authentication and data fetching
  const user = session?.user; // Extract the user from the session

  // Monitor session changes to check if the user is admin
  useEffect(() => {
    console.log('Checking user session...');
    if (session && user) {
      console.log('Session found. User:', user.email);

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL; // Get the admin email from env
      if (user.email === adminEmail) {
        console.log('User is admin.');
        setIsAdmin(true);
      } else {
        console.log('User is not admin.');
        setIsAdmin(false);
      }
    } else if (!session) {
      console.log('No session found, showing sign-in modal.');
      setShowSignInModal(true);
    }
  }, [session, user]);

  // Fetch booking data
  useEffect(() => {
    if (user && isAdmin) {
      const fetchBooking = async () => {
        console.log(`Fetching booking data for booking ID: ${id}`);
        const { data, error } = await supabase
          .from('NewBookingData')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
        } else {
          console.log('Booking data fetched successfully:', data);
          setBooking(data);
        }
        setLoading(false);
      };

      fetchBooking();
    } else {
      console.log(
        'User is not admin or not logged in, skipping booking fetch.'
      );
      setLoading(false);
    }
  }, [user, isAdmin, id, supabase]);

  // Handle decision submission
  const handleDecision = async (decision) => {
    console.log(
      `Submitting booking decision: ${decision} with comments: ${comments}`
    );
    try {
      const response = await fetch(`/api/sendResponseEmailToUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: decision,
          comments, // Pass comments as optional
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`Booking ${decision} successfully.`);
        alert(
          `Booking ${decision === 'approved' ? 'accepted' : 'declined'} successfully.`
        );
      } else {
        console.error(`Failed to ${decision} the booking:`, result.error);
        alert(`Failed to ${decision} the booking.`);
      }
    } catch (error) {
      console.error('Error processing booking decision:', error);
    }
  };

  // Handle sign-in completion and redirection
  const handleSignInComplete = () => {
    setShowSignInModal(false); // Hide modal after sign-in
    // Redirect back to the current booking decision page
    const redirectUrl = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/admin/bookings/${id}/decision`;
    window.location.href = redirectUrl;
  };

  // If still loading, show loading message
  if (loading) {
    console.log('Loading... awaiting session and booking data.');
    return <p>Loading... awaiting session and booking data.</p>;
  }

  // If user is not signed in, show sign-in modal
  if (!session && showSignInModal) {
    console.log('Showing sign-in modal.');
    return (
      <SignInModal
        onClose={() => setShowSignInModal(false)}
        onSignInComplete={handleSignInComplete}
      />
    );
  }

  // If the user is signed in but not an admin, show a restricted access message
  if (user && !isAdmin) {
    console.log('User is not admin, rendering restricted access message.');
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-red-600">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold">Restricted Access</h1>
          <p className="mt-4">Admin users only.</p>
        </div>
      </div>
    );
  }

  // If the user is an admin and booking data is available, show the booking decision form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-xl rounded-lg bg-gray-900 p-8">
        <h1 className="mb-4 text-center text-2xl font-bold">
          Manage Booking: {id}
        </h1>
        {booking ? (
          <>
            <p>
              <strong>User Email:</strong> {booking.user_email}
            </p>
            <p>
              <strong>Date:</strong> {new Date(booking.date).toLocaleString()}
            </p>
            <p>
              <strong>Pickup Location:</strong>{' '}
              {booking.pickup_location.address}
            </p>
            <p>
              <strong>Dropoff Location:</strong>{' '}
              {booking.dropoff_location.address}
            </p>
            <p>
              <strong>Estimated Distance:</strong> {booking.distance}
            </p>
            <p>
              <strong>Estimated Duration:</strong> {booking.duration}
            </p>
            <p>
              <strong>Estimated Cost:</strong> ${booking.cost}
            </p>

            <textarea
              placeholder="Add comments (optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mb-4 mt-4 w-full p-2 text-black"
            />

            <div className="mt-4 flex justify-between">
              <Button
                onClick={() => handleDecision('approved')}
                variant="green"
                size="md"
                title="Accept Booking"
              >
                Accept
              </Button>
              <Button
                onClick={() => handleDecision('declined')}
                variant="red"
                size="md"
                title="Decline Booking"
              >
                Decline
              </Button>
            </div>
          </>
        ) : (
          <p>Booking not found.</p>
        )}
      </div>
    </div>
  );
};

export default BookingDecisionPage;
