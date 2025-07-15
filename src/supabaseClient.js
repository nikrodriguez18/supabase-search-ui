import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://whbedbyfofdfxaftzagj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYmVkYnlmb2ZkZnhhZnR6YWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTIxMTYsImV4cCI6MjA2Njk4ODExNn0.Thjbam_ZLSz9Z_yi2Z54m2_tG6LaiNf11H9sISBBRqk'

export const supabase = createClient(supabaseUrl, supabaseKey)
