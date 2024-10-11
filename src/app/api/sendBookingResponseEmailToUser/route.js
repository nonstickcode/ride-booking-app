import nodemailer from 'nodemailer';
import supabase from '@/utils/supabaseServerClient'; // Assuming you are using Supabase for fetching data

export async function POST(request) {
  try {
    const { id, status } = await request.json(); // Accepts the booking ID and the current status

    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Fetch the booking data from the NewBookingData table using the UUID
    let { data: booking, error } = await supabase
      .from('NewBookingData')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return new Response(
        JSON.stringify({ success: false, message: 'Booking not found' }),
        { status: 404 }
      );
    }

    const {
      user_email,
      date,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      distance,
      duration,
      cost,
    } = booking;

    // Format the date and time
    const bookingDate = new Date(date);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(bookingDate);

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(bookingDate);

    // Create Google Maps links for pickup and dropoff locations
    const pickupCoords = `${pickupLocation.lat},${pickupLocation.lng}`;
    const dropoffCoords = `${dropoffLocation.lat},${dropoffLocation.lng}`;
    const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords}&destination=${dropoffCoords}&travelmode=driving`;

    // Set the email subject and content based on the status
    const subject =
      status === 'approved'
        ? 'Booking Request Accepted'
        : 'Booking Request Declined';
    const message =
      status === 'approved'
        ? '<strong>Congratulations, your booking has been accepted!</strong>'
        : '<strong>Unfortunately, your booking request has been declined.</strong>';

    // Configure Nodemailer with Brevo's SMTP service
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Email content with formatted date, time, and booking details
    const mailOptions = {
      from: 'rydeblk@gmail.com', // Verified sender email
      to: user_email, // User email from the booking
      subject: subject, // Dynamic subject based on status
      html: `
        <p>Hello,</p>
    
        <p>${message}</p>

        <p>Here are the details of your booking:</p>

        <ul style="padding-left: 0; list-style-position: inside;">
          <li style="padding-bottom: 2px;"><strong>Date:</strong> ${formattedDate}</li>
          <li style="padding-bottom: 2px;"><strong>Time:</strong> ${formattedTime}</li>
          <li style="padding-bottom: 2px;"><strong>Pickup Location:</strong> ${pickupLocation.address || 'N/A'}</li>
          <li style="padding-bottom: 2px;"><strong>Dropoff Location:</strong> ${dropoffLocation.address || 'N/A'}</li>
          <li style="padding-bottom: 2px;"><strong>Estimated Distance:</strong> ${distance}</li>
          <li style="padding-bottom: 2px;"><strong>Estimated Duration:</strong> ${duration}</li>
          <li style="padding-bottom: 2px;"><strong>Estimated Cost:</strong> $${cost}</li>
        </ul>
    
        <p>You can view the full trip route on Google Maps by clicking the following link:</p>
        <a href="${googleMapsTripLink}" target="_blank">View trip on Google Maps</a>

        <p>Thank you,<br>Your RYDEBLK Booking System</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking status email sent to user',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
