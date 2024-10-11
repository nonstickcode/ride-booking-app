'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import SignInModal from '@/components/SignInModal';
import supabase from '@/utils/supabaseClient';

const AdminBookingsDecisionModal = ({ decisionId, onClose }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const user = session?.user;

  // Check if the user is admin (based on email)
  useEffect(() => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (user) {
      if (user.email === adminEmail) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
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
      fetchBooking();
    }
  }, [decisionId, isAdmin]);

  // Handle booking decision (accept/decline)
  const handleDecision = async (decision) => {
    console.log(`Booking decision for ID ${decisionId}: ${decision}`);
    onClose();
  };

  if (loading) return null;

  if (!user && showSignInModal) {
    return (
      <SignInModal
        onClose={() => setShowSignInModal(false)}
        onSignInSuccess={() => setShowSignInModal(false)}
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

  // Create links for email and Google Maps location search
  const pickupGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    booking.pickup_location.address
  )}`;
  const dropoffGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    booking.dropoff_location.address
  )}`;
  const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    booking.pickup_location.address
  )}&destination=${encodeURIComponent(booking.dropoff_location.address)}&travelmode=driving`;

  return (
    <div className="modal-background fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="modal-container relative max-h-[95vh] w-[90vw] max-w-sm overflow-y-auto p-4 shadow-xl lg:max-h-[100vh]"
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

        <div className="mx-auto w-full max-w-md p-4">
          {/* Title */}
          <h2 className="mx-auto mb-3 text-center font-mono text-2xl font-bold text-red-500">
            <span>MANAGE BOOKING</span>
            <br />
            <span>REQUEST</span>
          </h2>

          <hr className="my-2 border-gray-700" />

          {/* Booking Details */}
          <div className="gap-8 text-white">
            <p>
              <strong className="text-gray-300">User Email:</strong>{' '}
              {booking.user_email}
            </p>
            <p>
              <strong className="text-gray-300">Date & Time:</strong>{' '}
              {new Date(booking.date).toLocaleString()}
            </p>
            <p>
              <strong className="text-gray-300">Pickup:</strong>{' '}
              <a
                href={pickupGoogleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline"
              >
                {booking.pickup_location.address}
              </a>
            </p>
            <p>
              <strong className="text-gray-300">Dropoff:</strong>{' '}
              <a
                href={dropoffGoogleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline"
              >
                {booking.dropoff_location.address}
              </a>
            </p>
            <p>
              <strong className="text-gray-300">Distance:</strong>{' '}
              {booking.distance}
            </p>
            <p>
              <strong className="text-gray-300">Duration:</strong>{' '}
              {booking.duration}
            </p>
            <p>
              <strong className="text-gray-300">Cost:</strong> ${booking.cost}
            </p>
            <p>
              <a
                href={googleMapsTripLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline"
              >
                View Trip on Google Maps
              </a>
            </p>
          </div>

          <hr className="my-2 border-gray-700" />

          {/* Buttons with spacing */}
          <div className="mt-4 flex justify-between gap-4">
            <Button
              onClick={() => handleDecision('declined')}
              variant="red"
              size="md"
              className="w-full"
              title="Decline Booking"
            >
              Decline
            </Button>
            <Button
              onClick={() => handleDecision('accepted')}
              variant="green"
              size="md"
              className="w-full"
              title="Accept Booking"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsDecisionModal;
