import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const {
      id,
      user_email,
      requestedDateAndTime, // This will be a combined ISO string
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      distance,
      duration,
      cost,
    } = await request.json();

    if (
      !id ||
      !user_email ||
      !requestedDateAndTime ||
      !pickupLocation ||
      !dropoffLocation ||
      !distance ||
      !duration ||
      !cost
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Parse the requestedDateAndTime into a JavaScript Date object
    const bookingDate = new Date(requestedDateAndTime);

    // Format the date to Thu Nov 28, 2024
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(bookingDate);

    // Format the time to hh:mm AM/PM and include time zone abbreviation
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZoneName: 'short', // This will give the abbreviated time zone (e.g., PST, EST)
    }).format(bookingDate);

    // Create Google Maps links for pickup and dropoff locations
    const pickupCoords = `${pickupLocation.lat},${pickupLocation.lng}`;
    const dropoffCoords = `${dropoffLocation.lat},${dropoffLocation.lng}`;
    const pickupGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${pickupCoords}`;
    const dropoffGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${dropoffCoords}`;
    const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords}&destination=${dropoffCoords}&travelmode=driving`;

    // Link to manage booking
    const manageBookingLink = `${process.env.APP_URL}/?bookingId=${id}`;

    // Configure Nodemailer with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: 'rydeblk@gmail.com',
      to: 'rydeblk@gmail.com',
      subject: 'New Booking Request',
      html: `
        <p>Hello you,</p>

        <p>You have received a new booking request with the following details:</p>

        <ul style="padding-left: 0; list-style-position: inside;">
          <li style="padding-bottom: 2px;"><strong>User:</strong> ${user_email}</li>
          <li style="padding-bottom: 2px;"><strong>Date:</strong> ${formattedDate}</li>
          <li style="padding-bottom: 2px;"><strong>Time:</strong> ${formattedTime}</li>
          <li style="padding-bottom: 2px;"><strong>Pickup Location:</strong> <a href="${pickupGoogleMapsLink}" target="_blank">${pickupLocation.address || 'View Location in Google Maps'}</a></li>
          <li style="padding-bottom: 2px;"><strong>Dropoff Location:</strong> <a href="${dropoffGoogleMapsLink}" target="_blank">${dropoffLocation.address || 'View Location in Google Maps'}</a></li>
          <li style="padding-bottom: 2px;"><strong>Estimated Distance:</strong> ${distance}</li>
          <li style="padding-bottom: 2px;"><strong>Estimated Duration:</strong> ${duration}</li>
          <li style="padding-bottom: 2px;"><strong>Estimated Cost:</strong> $${cost}</li>
        </ul>

        <p>You can view the full trip route on Google Maps by clicking the following link:</p>
        <a href="${googleMapsTripLink}" target="_blank">View trip on Google Maps</a>

        <p>Please manage this booking by clicking the button below:</p>
        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <a href="${manageBookingLink}" style="background-color: #007BFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px;">Manage Booking</a>
        </div>

        <p>Thank you,<br>Your RYDEBLK Booking System</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
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
