import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Manually set the path to your service account credentials JSON file
const SERVICE_ACCOUNT_KEY_PATH = path.resolve(
  process.cwd(),
  'config',
  'rydeblk-745fa49e3a56.json'
);

// Access the Calendar ID from environment variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Load service account credentials from the JSON file
const credentials = JSON.parse(
  fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, 'utf8')
);

// Helper function to set up Google OAuth2 client for the service account
function getGoogleClient() {
  const SCOPES = ['https://www.googleapis.com/auth/calendar'];

  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    SCOPES
  );

  return auth;
}

export async function POST(request) {
  try {
    // Parse the request body (expecting timeMin and timeMax for the query)
    const { timeMin, timeMax } = await request.json();

    // Validate the request parameters
    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'Missing required parameters: timeMin and timeMax' },
        { status: 400 }
      );
    }

    // Set up Google OAuth2 client with the service account
    const auth = getGoogleClient();

    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth });

    // TODO: Look into how much of the calendar is checked, we only need to check ahead = to advanced booking limit in AdminSettings DB
    // Query the Free/Busy information from the specific calendar
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: CALENDAR_ID }], // Use the hardcoded calendar ID
      },
    });

    // Access the calendar's busy slots using the correct calendar ID
    const busySlots = response.data.calendars[CALENDAR_ID]?.busy || [];

    // Return the busy time slots
    return NextResponse.json({ busySlots });
  } catch (error) {
    // Log the exact error message to understand what went wrong
    console.error('Error details:', error);
    return NextResponse.json(
      {
        error: 'Failed to check calendar availability',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
