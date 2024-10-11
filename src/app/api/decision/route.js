import supabase from '@/utils/supabaseServerClient';

export async function POST(request) {
  try {
    const { id, status, comment } = await request.json();

    // Log received data for debugging
    console.log('Received decision data:', { id, status, comment });

    // Validate required fields
    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Fetch the booking data from the NewBookingData table using the booking ID
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


    // TODO: when sms ready add check to either send sms if user setting say preferences is sms or default email.
    // Call the email route with the booking data, status, and comment
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

    if (!emailData.success) {
      console.error('Failed to send email:', emailData.error);
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
    console.error('Error in decision route:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
