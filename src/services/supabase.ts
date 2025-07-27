import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vesrohjmytmtpnadpxiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlc3JvaGpteXRtdHBuYWRweGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDk0OTcsImV4cCI6MjA1NzkyNTQ5N30._yCaY0b8DzYdVkuZvVhs2n6keQ_V5ubKoIbeQTG_yuA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
