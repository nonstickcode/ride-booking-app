// pages/api/sendSMS.js

export async function POST(request) {
  try {
    // Parse the request body to extract SMS details
    const { recipient, content } = await request.json();

    // Ensure all required fields are provided before sending the SMS
    if (!recipient || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: recipient or content' }),
        { status: 400 }
      );
    }

    // Configure the request to send SMS via Brevo API
    const smsResponse = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_SMS_API_KEY, // Use environment variable for Brevo API key
      },
      body: JSON.stringify({
        type: 'transactional',
        unicodeEnabled: false,
        sender: 'RYDEBLK', // The sender ID approved in Brevo
        recipient: recipient, // Recipient phone number from the request
        content: content, // SMS content from the request
      }),
    });

    const smsResult = await smsResponse.json();

    // Check if the SMS was sent successfully
    if (smsResponse.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'SMS sent successfully', data: smsResult }),
        { status: 200 }
      );
    } else {
      throw new Error(smsResult.message || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
