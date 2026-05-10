const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

(async () => {
  const admin = createClient(url, serviceRoleKey);
  
  // Find the latest user created by my test
  const { data: profiles } = await admin.from('profiles').select('id, email').order('created_at', { ascending: false }).limit(5);
  console.log('Recent Profiles:', profiles);

  if (profiles && profiles.length > 0) {
    const profileId = profiles[0].id;
    console.log(`Checking history for profile ${profileId}...`);

    const { data: turns, error } = await admin
      .from("session_turns")
      .select(`
        item_id,
        sessions!inner(profile_id)
      `)
      .eq("sessions.profile_id", profileId);
    
    if (error) {
      console.error('Error fetching turns:', error);
    } else {
      console.log('Found turns:', turns);
    }
  }
})();
