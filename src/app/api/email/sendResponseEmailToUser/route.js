import nodemailer from 'nodemailer';
import { formatDateTime } from '@/utils/dateLuxon'; // Importing the utility function

export async function POST(request) {
  try {
    const { booking } = await request.json(); // Accepts the booking data, including status and comment

    if (!booking || !booking.status) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing booking data or status',
        }),
        { status: 400 }
      );
    }

    const {
      user_email,
      requestedDateAndTime,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      distance,
      duration,
      cost,
      status,
      comment,
    } = booking;

    const { formattedDate, formattedTime } =
      formatDateTime(requestedDateAndTime);

    // Create Google Maps links for pickup and dropoff locations
    const pickupCoords = `${pickupLocation.lat},${pickupLocation.lng}`;
    const dropoffCoords = `${dropoffLocation.lat},${dropoffLocation.lng}`;
    const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords}&destination=${dropoffCoords}&travelmode=driving`;

    // Set the email subject and content based on the status
    const subject =
      status === 'accepted'
        ? 'Booking Request Accepted'
        : 'Booking Request Declined';

    const message =
      status === 'accepted'
        ? '<strong>Hey hey, your booking has been accepted!</strong>'
        : '<strong>Unfortunately, your booking request has been declined.</strong>';

    const commentSection = comment
      ? `<p><strong>Comment from Driver:</strong> ${comment}</p>`
      : `<p><strong>Comment from Driver:</strong> No comment provided.</p>`;

    // Configure Nodemailer with Brevo's SMTP service
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Email content with formatted date, time, booking details, and optional comment
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

        ${commentSection} <!-- Optional comment added here -->

        <p>You can view the full trip route on Google Maps by clicking the following link:</p>
        <a href="${googleMapsTripLink}" target="_blank">View trip on Google Maps</a>

        <p>Thank you,<br>Your RYDEBLK Booking System</p>
      `,
    };

    // TODO: Need to add back the link for Rider to add event for pick up to their Google Calendar now that we have TZ we can create proper new event with alert and TZ with a link they just hit create event

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
