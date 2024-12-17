import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to your service account credentials JSON file
const SERVICE_ACCOUNT_KEY_PATH = path.resolve(
  process.cwd(),
  'config',
  'rydeblk-745fa49e3a56.json'
);

// Access the Calendar ID from environment variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Load credentials from the service account JSON file
const credentials = JSON.parse(
  fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, 'utf8')
);

// Initialize Google OAuth client for the service account
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
    // Parse event data from the request body
    const { summary, description, start, end, timeZone, attendees } =
      await request.json();

    // Validate required fields
    if (!summary || !start || !end || !timeZone) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, start, end, or timeZone' },
        { status: 400 }
      );
    }

    // Set up Google OAuth client
    const auth = getGoogleClient();

    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth });

    // Prepare the event payload
    const event = {
      summary,
      description,
      start: { dateTime: start, timeZone },
      end: { dateTime: end, timeZone },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // Email reminder 24 hours before
          { method: 'popup', minutes: 10 }, // Popup reminder 10 minutes before
        ],
      },
    };

    // Insert the event into Google Calendar
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    if (response.data && response.data.htmlLink) {
      console.log(
        'Google Calendar Event created successfully:',
        response.data.htmlLink
      );
      return NextResponse.json({
        success: true,
        message: 'Event created successfully',
        eventLink: response.data.htmlLink,
        eventId: response.data.id,
      });
    } else {
      console.warn(
        'Google Calendar Event creation failed: No event link returned.'
      );
      return NextResponse.json(
        { success: false, error: 'Event creation failed, no link returned.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      'Error creating calendar event:',
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        error: 'Failed to create event',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
