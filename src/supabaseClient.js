// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pzgfxdliqmyvacadiiky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Z2Z4ZGxpcW15dmFjYWRpaWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDM0MTAsImV4cCI6MjA2OTYxOTQxMH0.lbiz2NB_97SX112wnLnKBbMh2l9XapewpIPA9M4p9jU'; // From your Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseKey);
