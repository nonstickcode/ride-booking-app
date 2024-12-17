import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Safely load service account credentials from the environment variable
let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', error.message);
  throw new Error(
    'Invalid or missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable.'
  );
}

// Access the Calendar ID from environment variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

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
    const { summary, description, start, end, timeZone, bookingData } =
      await request.json();

    // Validate required fields
    if (!summary || !start || !end || !timeZone || !bookingData) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: summary, start, end, timeZone, or bookingData',
        },
        { status: 400 }
      );
    }

    // Set up Google OAuth client
    const auth = getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth });

    // Generate Google Maps links
    const pickupLink = bookingData.pickupLocation
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingData.pickupLocation)}`
      : 'Unavailable';

    const dropoffLink = bookingData.dropoffLocation
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingData.dropoffLocation)}`
      : 'Unavailable';

    const tripNavigationLink =
      bookingData.pickupLocation && bookingData.dropoffLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(bookingData.pickupLocation)}&destination=${encodeURIComponent(bookingData.dropoffLocation)}&travelmode=driving`
        : 'Unavailable';

    // Build event description with links
    const detailedDescription = `
Booking Details:
- <strong>User Email:</strong> ${bookingData.userEmail || 'N/A'}
- <strong>Pickup Location:</strong> <a href="${pickupLink}" target="_blank">${bookingData.pickupLocation || 'N/A'}</a>
- <strong>Dropoff Location:</strong> <a href="${dropoffLink}" target="_blank">${bookingData.dropoffLocation || 'N/A'}</a>
- <strong>Distance:</strong> ${bookingData.distance || 'N/A'}
- <strong>Duration:</strong> ${bookingData.duration || 'N/A'}
- <strong>Cost:</strong> $${bookingData.cost || 'N/A'}

<p><a href="${tripNavigationLink}" target="_blank"><strong>Trip Navigation Link</strong></a></p>
`;

    // Prepare the event payload
    const event = {
      summary,
      description: detailedDescription,
      start: { dateTime: start, timeZone },
      end: { dateTime: end, timeZone },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    // Insert event into Google Calendar
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
      throw new Error('Event creation failed, no event link returned.');
    }
  } catch (error) {
    console.error('Error creating calendar event:', error.message);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}
