import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vpwnvsekkcbdhaenxobp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd252c2Vra2NiZGhhZW54b2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDYyMDYsImV4cCI6MjA2MzUyMjIwNn0.7AmaBuB3OB_sDpKDg9IWDIfQDf2e6OwMXBoxBYaFhgw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 