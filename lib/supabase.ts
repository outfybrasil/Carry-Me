import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dadplttoibcnsbgccwyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZHBsdHRvaWJjbnNiZ2Njd3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTkzMTYsImV4cCI6MjA4Mzg5NTMxNn0.C1FvfFaE-GnfIpjn_xMneoY_avikIUQicVGBSMuhR_s';

export const supabase = createClient(supabaseUrl, supabaseKey);