// src/app/api/bookings/actions/[id]/decline/route.js
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
        null, // replacer
        2     // space argument for indentation
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
      .eq('id', id) // Ensure the 'id' matches the column in your table
      .single();

    if (error || !booking) {
      console.error('Error fetching booking:', error);
      return new Response(
        JSON.stringify(
          { success: false, message: 'Booking not found' },
          null, // replacer
          2     // space argument for indentation
        ),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the booking status to 'declined'
    let { error: updateError } = await supabase
      .from('NewBookingData')
      .update({ status: 'declined' }) // Update the status to "declined"
      .eq('id', id);

    if (updateError) {
      console.error('Error updating booking status:', updateError);
      return new Response(
        JSON.stringify(
          { success: false, message: 'Failed to update booking status' },
          null, // replacer
          2     // space argument for indentation
        ),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Manually update the booking object to reflect the status change
    booking.status = 'declined';

    // Log the success message
    console.log('Booking DECLINED successfully:', id);

    // Return the success message and booking data, formatted nicely
    return new Response(
      JSON.stringify(
        {
          success: true,
          message: 'Booking DECLINED',
          booking: booking // Include the full booking data with updated status
        },
        null, // replacer
        2     // space argument for indentation
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing decline:', error);
    return new Response(
      JSON.stringify(
        { success: false, error: error.message },
        null, // replacer
        2     // space argument for indentation
      ),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
