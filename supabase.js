const SUPABASE_URL = 
'https://whoudgeyheuftwzozvvk.supabase.co';

const SUPABASE_KEY = 
'sb_publishable_avMiAWfDMQr1QwvqRdzWMg_4LiYs_JT';

const supabaseClient = 
supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase JS Loaded');

console.log(supabaseClient);

window.supabaseClient = supabaseClient;
