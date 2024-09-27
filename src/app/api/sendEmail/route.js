import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    // Parse the request body to extract booking details
    const { date, time, pickupLocation, dropoffLocation, distance, duration } =
      await request.json();

    // Ensure all required fields are provided before sending the email
    if (
      !date ||
      !time ||
      !pickupLocation ||
      !dropoffLocation ||
      !distance ||
      !duration
    ) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Configure Nodemailer with Brevo's SMTP service
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
      from: 'rydeblk@gmail.com', // Verified sender email / verified on Brevo dashboard
      to: 'rydeblk@gmail.com', // Destination email
      subject: 'New Booking Request',
      text: `Hello,

You have received a new booking request with the following details:

- Date: ${date}
- Time: ${time}
- Pickup Location: ${pickupLocation}
- Dropoff Location: ${dropoffLocation}
- Estimated Distance: ${distance}
- Estimated Duration: ${duration}

Please review the details and respond as soon as possible.

Thank you,
Your Ride Booking System`,
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
