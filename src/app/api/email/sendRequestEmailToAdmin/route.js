import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const {
      id, // Booking ID
      user_email, // User email
      date, // Combined date-time
      pickup_location: pickupLocation, // Updated naming to match your saved object
      dropoff_location: dropoffLocation, // Updated naming
      distance,
      duration,
      cost,
    } = await request.json();

    if (
      !id ||
      !user_email || // Check if the user email is provided
      !date ||
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
    const pickupGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${pickupCoords}`;
    const dropoffGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${dropoffCoords}`;
    const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords}&destination=${dropoffCoords}&travelmode=driving`;

    // Link to the decision page where the admin can accept or decline the booking
    const manageBookingLink = `${process.env.APP_URL}/?decisionId=${id}`;

    // Configure Nodemailer with Brevo's SMTP service
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Email content with formatted date and time, user email, and the "Manage Booking" button
    const mailOptions = {
      from: 'rydeblk@gmail.com', // Verified sender email
      to: 'rydeblk@gmail.com', // Destination email
      subject: 'New Booking Request',
      html: `
    <p>Hello,</p>

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
