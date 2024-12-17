import supabase from '@/utils/supabaseServerClient';

// Helper function to parse "X hours Y mins" into total minutes
function parseDuration(durationString) {
  const hoursMatch = durationString.match(/(\d+)\s*hour/); // Extract hours
  const minutesMatch = durationString.match(/(\d+)\s*min/); // Extract minutes

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  return hours * 60 + minutes; // Convert to total minutes
}

export async function POST(request) {
  try {
    const { id, status, comment } = await request.json();

    console.log('Received decision data:', { id, status, comment });

    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const { data: booking, error: fetchError } = await supabase
      .from('NewBookingData')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      console.error('Booking not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, message: 'Booking not found' }),
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('NewBookingData')
      .update({ status, comment: comment || 'No comment given with decision' })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update booking status:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to update booking status',
        }),
        { status: 500 }
      );
    }

    let calendarSuccess = false;
    let emailSuccess = false;

    // Create Google Calendar Event if accepted
    if (status === 'accepted') {
      try {
        const { requestedDateAndTime, duration } = booking;

        const totalMinutes = parseDuration(duration);
        const doubledDuration = totalMinutes * 2;

        const startDateTime = new Date(requestedDateAndTime).toISOString();
        const endDateTime = new Date(
          new Date(requestedDateAndTime).getTime() + doubledDuration * 60000
        ).toISOString();

        const calendarResponse = await fetch(
          `${process.env.APP_URL}/api/calendar/createEvent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              summary: `Booking with ${booking.user_email}`,
              description: `Pickup: ${booking.pickup_location.address}\nDropoff: ${booking.dropoff_location.address}\nCost: $${booking.cost}`,
              start: startDateTime,
              end: endDateTime,
              timeZone: 'UTC',
              bookingData: {
                userEmail: booking.user_email,
                pickupLocation: booking.pickup_location.address,
                dropoffLocation: booking.dropoff_location.address,
                distance: booking.distance,
                duration: booking.duration,
                cost: booking.cost,
              },
            }),
          }
        );

        const calendarData = await calendarResponse.json();
        if (calendarResponse.ok && calendarData.success) {
          calendarSuccess = true;
          console.log('Google Calendar Event created:', calendarData.eventLink);
        } else {
          console.warn('Calendar event creation failed:', calendarData.error);
        }
      } catch (calendarError) {
        console.warn(
          'Error creating Google Calendar event:',
          calendarError.message
        );
      }
    }

    // Send email to user
    try {
      const emailResponse = await fetch(
        `${process.env.APP_URL}/api/email/sendResponseEmailToUser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking: { ...booking, status, comment } }),
        }
      );

      const emailData = await emailResponse.json();
      if (emailResponse.ok && emailData.success) {
        emailSuccess = true;
        console.log('Email sent successfully');
      } else {
        console.warn('Email sending failed:', emailData.error);
      }
    } catch (emailError) {
      console.warn('Error sending email:', emailError.message);
    }

    // Return combined success response
    return new Response(
      JSON.stringify({
        success: true,
        updateSuccess: true,
        emailSuccess,
        calendarSuccess,
        message: `Booking ${status.toUpperCase()}, email ${
          emailSuccess ? 'sent' : 'failed'
        }, and calendar event ${
          calendarSuccess ? 'created' : 'failed'
        } successfully.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in decision route:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
