import supabase from '@/utils/supabaseServerClient'; // Use server-side Supabase client

export async function GET(request, { params }) {
  // Extract the private key from the environment variables
  const privateKey = process.env.RYDEBLK_SECRET_KEY_EMAIL_API_VALIDATION;

  // Get the key from the query string
  const url = new URL(request.url);
  const keyFromQuery = url.searchParams.get('key');

  // Validate the key from the query against the server-side private key
  if (keyFromQuery !== privateKey) {
    return new Response(
      JSON.stringify(
        { success: false, message: 'Unauthorized: Invalid key' },
        null,
        2
      ),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { id } = params; // Extract booking ID from the URL params

    // Log the ID for debugging purposes
    console.log('Booking ID received for decline:', id);

    // Fetch the booking data from the NewBookingData table using the UUID
    let { data: booking, error } = await supabase
      .from('NewBookingData')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return new Response(
        JSON.stringify(
          { success: false, message: 'Booking not found' },
          null,
          2
        ),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the booking status to 'declined'
    let { error: updateError } = await supabase
      .from('NewBookingData')
      .update({ status: 'declined' })
      .eq('id', id);

    if (updateError) {
      return new Response(
        JSON.stringify(
          { success: false, message: 'Failed to update booking status' },
          null,
          2
        ),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Manually update the booking object to reflect the status change
    booking.status = 'declined';

    // Call the API to send the email to the user about the booking status
    await fetch(`${process.env.APP_URL}/api/sendBookingResponseEmailToUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: booking.id,
        status: 'declined', // This booking is declined
      }),
    });

    // Return the success message and booking data, formatted nicely
    return new Response(
      JSON.stringify(
        {
          success: true,
          message: 'Booking DECLINED',
          booking: booking // Include the full booking data with updated status
        },
        null,
        2
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify(
        { success: false, error: error.message },
        null,
        2
      ),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
