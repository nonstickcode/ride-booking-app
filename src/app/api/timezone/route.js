// api/timezone/route.js

export async function POST(req) {
  try {
    const { lat, lng } = await req.json();

    // Use the native fetch API to call the Google Timezone API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(
        Date.now() / 1000
      )}&key=${process.env.GOOGLE_TIMEZONES_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errorMessage || 'Failed to fetch timezone');
    }

    return new Response(JSON.stringify({ timezone: data.timeZoneId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching timezone:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch timezone' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
