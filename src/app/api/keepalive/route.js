import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role for secure backend access
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    // Perform a simple query to keep the database active
    const { data, error } = await supabase
      .from('NewBookingData')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Keepalive query failed:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Keepalive failed' });
    }

    console.log('Keepalive query successful:', data);
    return res
      .status(200)
      .json({ success: true, message: 'Keepalive successful' });
  } catch (err) {
    console.error('Error in keepalive endpoint:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
