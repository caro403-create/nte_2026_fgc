import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_PUBLISHABLE_KEY']);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test_user_fgc@gmail.com',
    password: 'password123'
  });
  console.log('Result:', error || data);
}
test();
