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
    // Parse the request body (expecting event details)
    const { summary, description, start, end, attendees } = await request.json();

    // Validate the request parameters
    if (!summary || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: summary, start, and end' },
        { status: 400 }
      );
    }

    // Set up Google OAuth2 client with the service account
    const auth = getGoogleClient();

    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth });

    // Create a new event
    const event = {
      summary,
      description,
      start: {
        dateTime: start, // Must be in ISO 8601 format
        timeZone: 'UTC', // Replace with the desired time zone if necessary
      },
      end: {
        dateTime: end, // Must be in ISO 8601 format
        timeZone: 'UTC', // Replace with the desired time zone if necessary
      },
      attendees: attendees || [], // Optional array of attendee objects
    };

    // Insert the event into the calendar
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    // Return the created event details
    return NextResponse.json({ event: response.data });
  } catch (error) {
    // Log the exact error message to understand what went wrong
    console.error('Error details:', error);
    return NextResponse.json(
      {
        error: 'Failed to create calendar event',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
