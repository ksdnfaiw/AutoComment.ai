import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://fatssalzlbpjilxpfuhw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhdHNzYWx6bGJwamlseHBmdWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDM0OTUsImV4cCI6MjA3MDQ3OTQ5NX0.eO4CwmtALYv1Nf9dhrMlucqnFtwyKxfC53dnjQ6_wyI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
