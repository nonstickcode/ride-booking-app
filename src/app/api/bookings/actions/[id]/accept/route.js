// src/app/api/bookings/actions/[id]/accept/route.js
import supabase from '@/utils/supabaseServerClient'; // Use server-side Supabase client

export async function GET(request, { params }) {
  // Extract the private key from the environment variables
  const privateKey = process.env.RYDEBLK_SECRET_KEY_EMAIL_API_VALIDATION;

  // Get the key from the query string
  const url = new URL(request.url);
  const keyFromQuery = url.searchParams.get('key');

  // Validate the key from the query against the server-side private key
  if (keyFromQuery !== privateKey) {
    // If the key doesn't match, return an Unauthorized response
    return new Response(
      JSON.stringify({ success: false, message: 'Unauthorized: Invalid key' }),
      { status: 403 }
    );
  }

  try {
    const { id } = params; // Extract booking ID from the URL params

    // Log the ID for debugging purposes
    console.log('Booking ID received for acceptance:', id);

    // Fetch the booking data from the NewBookingData table using the UUID
    let { data: booking, error } = await supabase
      .from('NewBookingData')
      .select('*')
      .eq('id', id) // Ensure the 'id' matches the column in your table
      .single();

    if (error || !booking) {
      console.error('Error fetching booking:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Booking not found' }),
        { status: 404 }
      );
    }

    // Update the booking status to 'approved'
    let { error: updateError } = await supabase
      .from('NewBookingData')
      .update({ status: 'approved' }) // Update the status to "approved"
      .eq('id', id);

    if (updateError) {
      console.error('Error updating booking status:', updateError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update booking status' }),
        { status: 500 }
      );
    }

    // Log the success message
    console.log('Booking APPROVED successfully:', id);

    return new Response(
      JSON.stringify({ success: true, message: 'Booking APPROVED' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing acceptance:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
