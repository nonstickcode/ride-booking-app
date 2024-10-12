'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import SignInModal from '@/components/modals/SignInModal';
import { FaArrowDown } from 'react-icons/fa';
import { formatDateTime } from '@/utils/dateTime';

// Helper function to generate the Gmail compose link
const generateGmailLink = (booking) => {
  const subject = encodeURIComponent(
    `Booking Details for ${booking.user_email}`
  );
  const body = encodeURIComponent(`
Hi 👋 Jamie here with RYDEBLK

    Booking Details:

    User Email: ${booking.user_email}
    Date & Time: ${new Date(booking.date).toLocaleString()}
    Pickup: ${booking.pickup_location.address}
    Dropoff: ${booking.dropoff_location.address}
    Distance: ${booking.distance}
    Duration: ${booking.duration}
    Cost: $${booking.cost}

    Please enter your response below this line:
  `);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${booking.user_email}&su=${subject}&body=${body}`;
};

// Helper function to generate a Google Calendar link
const generateCalendarLink = (booking) => {
  if (!booking.date) {
    console.error('Invalid date:', booking.date);
    return '#'; // Return a safe value that won't cause navigation
  }

  try {
    const startDate = new Date(booking.date);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid date value');
    }

    // Extract the year, month, and day from the booking date
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1; // Months are zero-indexed, so we add 1
    const day = startDate.getDate();

    // Generate the Google Calendar URL for the specific day
    const url = `https://calendar.google.com/calendar/u/0/r/day/${year}/${month}/${day}`;

    return url;
  } catch (error) {
    console.error('Error generating calendar link:', error);
    return '#'; // Return a safe value that won't cause navigation
  }
};

const AdminDecisionModal = ({ bookingId, onClose }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comment, setComment] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isBouncing, setIsBouncing] = useState(true);

  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const user = session?.user;

  // Check if the user is admin (based on email)
  useEffect(() => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (user) {
      setIsAdmin(user.email === adminEmail);
    } else {
      setShowSignInModal(true);
    }
  }, [user]);

  // Remove bounce after a few seconds
  useEffect(() => {
    const bounceTimeout = setTimeout(() => {
      setIsBouncing(false);
    }, 5000); // Stops bouncing after 5 seconds

    return () => clearTimeout(bounceTimeout);
  }, []);

  // Fetch booking data when bookingId is provided
  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingId && isAdmin) {
        try {
          const { data, error } = await supabaseClient
            .from('NewBookingData')
            .select('*')
            .eq('id', bookingId)
            .single();

          if (error) {
            console.error('Error fetching booking:', error);
          } else {
            setBooking(data);
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBooking();
  }, [bookingId, isAdmin, supabaseClient]);

  // Handle accept/decline action
  const handleDecision = async (status) => {
    const verb = status === 'accepted' ? 'accept' : 'decline';
    const confirmAction = window.confirm(
      `Are you sure you want to ${verb} this booking?`
    );
    if (!confirmAction) return; // Exit if the user cancels the confirmation

    const commentToSend =
      comment.trim() === '' ? 'No comment given with decision' : comment;

    console.log('Submitting decision with comment:', commentToSend);

    try {
      const response = await fetch(`/api/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status,
          comment: commentToSend,
        }),
      });

      const data = await response.json();
      console.log('Response from /api/decision:', data);

      if (data.success) {
        // Handling success/failure scenarios
        if (data.message.includes('and email sent')) {
          alert(
            `Booking ${status.toUpperCase()} and response email / sms sent SUCCESSFULLY 👍`
          );
        } else {
          alert(
            `Booking ${status.toUpperCase()} but response email / sms FAILED to send ❗`
          );
        }
      } else {
        alert(
          `Booking ${status.toUpperCase()} but FAILED to process response email/sms ❗`
        );
      }
      onClose(); // Close modal after decision
    } catch (error) {
      console.error('FAILED to update booking:', error);
      alert(
        '❌ ERROR processing booking and sending email / sms response. Please try again. ❌'
      );
    }
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

  if (user && !isAdmin) {
    return (
      <div className="modal-background fixed inset-0 z-50 flex items-center justify-center">
        <div className="modal-container relative w-[90vw] max-w-sm border border-red-500 bg-white p-2 shadow-xl">
          <Button
            onClick={onClose}
            variant="close"
            size="icon"
            className="absolute right-1 top-1"
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

  if (!booking) return <div>Booking not found.</div>;

  const { formattedDate, formattedTime } = formatDateTime(
    booking.requestedDateAndTime
  );

  const pickupGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.pickup_location.address)}`;
  const dropoffGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.dropoff_location.address)}`;
  const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(booking.pickup_location.address)}&destination=${encodeURIComponent(booking.dropoff_location.address)}&travelmode=driving`;
  const gmailLink = generateGmailLink(booking);
  const calendarLink = generateCalendarLink(booking); // need to hook this up to create the new calendar event option for user now including time zone in event creation

  return (
    <div className="modal-background fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-container relative max-h-[95vh] w-[90vw] max-w-sm overflow-y-auto p-4 shadow-xl lg:max-h-[100vh]">
        <Button
          onClick={onClose}
          variant="close"
          size="icon"
          className="absolute right-1 top-1"
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="mx-auto w-full max-w-md p-4">
          <h2 className="mx-auto mb-3 text-center font-mono text-2xl font-bold tracking-widest text-red-500">
            MANAGE BOOKING
            <br />
            <div className="flex items-center justify-center">
              <FaArrowDown
                className={`mr-10 h-5 w-5 text-gray-400 ${
                  isBouncing ? 'animate-bounce-down' : ''
                }`}
              />
              <span>REQUEST</span>
              <FaArrowDown
                className={`ml-10 h-5 w-5 text-gray-400 ${
                  isBouncing ? 'animate-bounce-down' : ''
                }`}
              />
            </div>
          </h2>

          <hr className="my-2 border-gray-700" />
          <div className="gap-8 text-white">
            <div className="my-2 flex">
              <strong className="min-w-[110px] italic text-gray-300">
                User Email:
              </strong>
              <a
                href={gmailLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow text-blue-300 underline hover:text-green-300"
              >
                {booking.user_email}
              </a>
            </div>

            <div className="my-2 flex">
              <strong className="min-w-[110px] italic text-gray-300">
                Date:
              </strong>
              <span className="flex-grow">{formattedDate}</span>
            </div>

            <div className="my-2 flex">
              <strong className="min-w-[110px] italic text-gray-300">
                Time:
              </strong>
              <span className="flex-grow">{formattedTime}</span>
            </div>

            <div className="my-2 flex">
              <strong className="min-w-[110px] italic text-gray-300">
                Pickup:
              </strong>
              <a
                href={pickupGoogleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow text-blue-300 underline hover:text-green-300"
              >
                {booking.pickup_location.address}
              </a>
            </div>

            <div className="my-2 flex">
              <strong className="min-w-[110px] italic text-gray-300">
                Dropoff:
              </strong>
              <a
                href={dropoffGoogleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow text-blue-300 underline hover:text-green-300"
              >
                {booking.dropoff_location.address}
              </a>
            </div>
          </div>

          <div className="text-center mt-4">
  <div className="my-2 flex justify-center">
    <strong className="italic text-gray-300 mr-2">
      Estimated Distance:
    </strong>
    <span>{booking.distance}</span>
  </div>

  <div className="my-2 flex justify-center">
    <strong className="italic text-gray-300 mr-2">
      Estimated Duration:
    </strong>
    <span>{booking.duration}</span>
  </div>

  <div className="my-2 flex justify-center">
    <strong className="italic text-gray-300 mr-2">
      Estimated Cost:
    </strong>
    <span>${booking.cost}</span>
  </div>

  <div className="my-1">
    <a
      href={googleMapsTripLink}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold text-blue-300 underline hover:text-green-300"
    >
      View Trip on Google Maps
    </a>
  </div>
</div>


          <hr className="my-2 border-gray-700" />
          <div className="">
            <label htmlFor="comments" className="font-bold text-gray-300">
              Comments (optional):
            </label>
            <textarea
              id="comments"
              name="comments"
              rows="4"
              maxLength="10000"
              value={comment}
              onChange={(e) => setComment(e.target.value)} // Update comment state
              placeholder={`Add comments for ${booking.user_email}. These will be included in the automated email or SMS notifying them of your decision.`}
              className="mt-2 w-full rounded-md border border-gray-300 bg-gray-800 p-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <hr className="my-2 border-gray-700" />
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

export default AdminDecisionModal;
