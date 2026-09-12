const SUPABASE_URL = 
'https://whoudgeyheuftwzozvvk.supabase.co';

const SUPABASE_KEY = 
'sb_publishable_szZbDyXPMzauR98u-oMxDQ_u01F6gpP';

const supabaseClient = 
supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase JS Loaded');

console.log(supabaseClient);

window.supabaseClient = supabaseClient;
