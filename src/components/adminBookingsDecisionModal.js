import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'; // Supabase hooks
import SignInModal from '@/components/SignInModal'; // Assume SignInModal is available for signing in
import supabase from '@/utils/supabaseClient'; // Assuming you have a utility file for Supabase

const AdminBookingsDecisionModal = ({ decisionId, onClose }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const session = useSession(); // Get the current user session
  const supabaseClient = useSupabaseClient(); // Supabase client
  const user = session?.user; // Get the user from the session

  // Check if the user is admin (based on email)
  useEffect(() => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL; // Load admin email from environment variable
    if (user) {
      if (user.email === adminEmail) {
        setIsAdmin(true); // User is an admin
      } else {
        setIsAdmin(false); // User is not an admin
      }
    } else {
      // If no user, prompt to sign in
      setShowSignInModal(true);
    }
  }, [user]);

  // Fetch booking data when decisionId is provided
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('NewBookingData')
          .select('*')
          .eq('id', decisionId)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
        } else {
          setBooking(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setLoading(false);
      }
    };

    if (decisionId && isAdmin) {
      fetchBooking(); // Only fetch if the user is admin
    }
  }, [decisionId, isAdmin]);

  // Handle booking decision (accept/decline)
  const handleDecision = async (decision) => {
    console.log(`Booking decision for ID ${decisionId}: ${decision}`);
    // Add logic to handle accept/decline and send email
    onClose();
  };

  if (loading) return <p>Loading...</p>;

  if (!user && showSignInModal) {
    return (
      <SignInModal
        onClose={() => setShowSignInModal(false)}
        onSignInSuccess={() => {
          setShowSignInModal(false); // Close modal after successful sign-in
        }}
      />
    );
  }

  // If user is not admin, show not authorized message
  if (user && !isAdmin) {
    return (
      <div className="modal-background fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="modal-container relative w-[90vw] max-w-sm border border-red-500 bg-white p-2 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            onClick={onClose}
            variant="close"
            size="icon"
            className="absolute right-1 top-1"
            aria-label="Close"
            title="Close window"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="p-8 text-center text-red-600">
            <h2 className="mb-4 text-xl font-bold">Not Authorized</h2>
            <p>You do not have permission to manage this booking.</p>
          </div>
        </div>
      </div>
    );
  }

  // If no booking found, show message
  if (!booking) return <p>Booking not found.</p>;

  return (
    <div className="modal-background fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="modal-container relative w-[90vw] max-w-sm bg-white p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          variant="close"
          size="icon"
          className="absolute right-1 top-1"
          aria-label="Close"
          title="Close window"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="p-8">
          <h2 className="mb-4 text-center text-xl font-bold">
            Manage Booking {decisionId}
          </h2>
          <p>
            <strong>User Email:</strong> {booking.user_email}
          </p>
          <p>
            <strong>Date:</strong> {new Date(booking.date).toLocaleString()}
          </p>
          <p>
            <strong>Pickup Location:</strong> {booking.pickup_location.address}
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

          <div className="mt-4 flex justify-between">
            <Button
              onClick={() => handleDecision('accepted')}
              variant="green"
              size="md"
            >
              Accept
            </Button>
            <Button
              onClick={() => handleDecision('declined')}
              variant="red"
              size="md"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsDecisionModal;
