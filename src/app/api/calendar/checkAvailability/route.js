import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Safely load service account credentials from the environment variable
const credentials = {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

// Access the Calendar ID from environment variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Helper function to set up Google OAuth2 client
function getGoogleClient() {
  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );
}

export async function POST(request) {
  try {
    // Parse request body
    const { timeMin, timeMax } = await request.json();

    // Validate required parameters
    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'Missing required parameters: timeMin and timeMax' },
        { status: 400 }
      );
    }

    // Set up Google OAuth2 client
    const auth = getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // Query Free/Busy information
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots = response.data.calendars[CALENDAR_ID]?.busy || [];

    return NextResponse.json({ busySlots });
  } catch (error) {
    console.error('Error checking calendar availability:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to check calendar availability',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
