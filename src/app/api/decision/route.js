import supabase from '@/utils/supabaseServerClient';

// Helper function to parse "X hours Y mins" into total minutes
function parseDuration(durationString) {
  const hoursMatch = durationString.match(/(\d+)\s*hour/); // Extract hours
  const minutesMatch = durationString.match(/(\d+)\s*min/); // Extract minutes

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  return (hours * 60) + minutes; // Convert to total minutes
}

export async function POST(request) {
  try {
    const { id, status, comment } = await request.json();

    console.log('Received decision data:', { id, status, comment });

    // Validate required fields
    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Fetch the booking data
    const { data: booking, error: fetchError } = await supabase
      .from('NewBookingData')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Fetched booking data:', booking);

    if (fetchError || !booking) {
      console.error('Booking not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, message: 'Booking not found' }),
        { status: 404 }
      );
    }

    // Update the booking status and comment
    const { error: updateError } = await supabase
      .from('NewBookingData')
      .update({
        status,
        comment: comment || 'No comment given with decision',
      })
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

    // Create Google Calendar Event only if status is accepted
    if (status === 'accepted') {
      try {
        const { requestedDateAndTime, duration } = booking;

        if (!requestedDateAndTime || !duration) {
          throw new Error('Missing requestedDateAndTime or duration in booking data.');
        }

        // Parse duration and double it
        const totalMinutes = parseDuration(duration);
        if (isNaN(totalMinutes)) {
          throw new Error('Invalid duration format');
        }

        const doubledDuration = totalMinutes * 2;

        // Use the existing ISO format time and calculate end time
        const startDateTime = new Date(requestedDateAndTime).toISOString();
        const endDateTime = new Date(
          new Date(requestedDateAndTime).getTime() + doubledDuration * 60000
        ).toISOString();

        console.log('Start DateTime:', startDateTime);
        console.log('End DateTime:', endDateTime);

        // Call Google Calendar API to create an event
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
              timeZone: 'UTC', // Using UTC
            }),
          }
        );

        const calendarData = await calendarResponse.json();

        if (!calendarResponse.ok || !calendarData.success) {
          console.warn(
            'Google Calendar event creation failed:',
            calendarData.error || 'Event response not OK'
          );
        } else {
          console.log('Google Calendar Event created:', calendarData.eventLink);
        }
      } catch (calendarError) {
        console.warn(
          'Error creating Google Calendar event:',
          calendarError.message
        );
      }
    }

    // Send email to the user
    const emailResponse = await fetch(
      `${process.env.APP_URL}/api/email/sendResponseEmailToUser`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: { ...booking, status, comment },
        }),
      }
    );

    const emailData = await emailResponse.json();

    if (!emailResponse.ok || !emailData.success) {
      console.error(
        'Failed to send email:',
        emailData.error || 'Email response not OK'
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Booking ${status.toUpperCase()} but failed to send email.`,
        }),
        { status: 500 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Booking ${status.toUpperCase()} and email sent successfully.`,
        booking: { ...booking, status, comment },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in decision route:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
