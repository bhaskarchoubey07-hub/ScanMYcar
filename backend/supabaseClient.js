require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment.");
  process.exit(1);
}

// Elevated privileges client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
