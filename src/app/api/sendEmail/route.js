import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    // Parse the request body to extract booking details
    const {
      date,
      time,
      pickupLocation,
      dropoffLocation,
      distance,
      duration,
      cost,
    } = await request.json();

    // Ensure all required fields are provided before sending the email
    if (
      !date ||
      !time ||
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

    // Create Google Maps links for pickup and dropoff locations
    const pickupCoords = `${pickupLocation.lat},${pickupLocation.lng}`;
    const dropoffCoords = `${dropoffLocation.lat},${dropoffLocation.lng}`;
    const pickupGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${pickupCoords}`;
    const dropoffGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${dropoffCoords}`;
    const googleMapsTripLink = `https://www.google.com/maps/dir/?api=1&origin=${pickupCoords}&destination=${dropoffCoords}&travelmode=driving`;

    // Configure Nodemailer with Brevo's SMTP service
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Email content with links to Google Maps for the pickup and dropoff locations
    const mailOptions = {
      from: 'rydeblk@gmail.com', // Verified sender email / verified on Brevo dashboard
      to: 'rydeblk@gmail.com', // Destination email
      subject: 'New Booking Request',
      html: `Hello,<br><br>

You have received a new booking request with the following details:<br><br>

- Date: ${date}<br>
- Time: ${time}<br>
- Pickup Location: <a href="${pickupGoogleMapsLink}" target="_blank">${pickupLocation.address || 'View Location in Google Maps'}</a><br>
- Dropoff Location: <a href="${dropoffGoogleMapsLink}" target="_blank">${dropoffLocation.address || 'View Location in Google Maps'}</a><br>
- Estimated Distance: ${distance}<br>
- Estimated Duration: ${duration}<br>
- Estimated Cost: $${cost}<br><br>

You can view the full trip route on Google Maps by clicking the following link:<br>
<a href="${googleMapsTripLink}" target="_blank">View trip on Google Maps</a><br><br>

Please review the details and respond as soon as possible.<br><br>

Thank you,<br>
Your RYDEBLK Booking System`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with a success message
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
