import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zqpevmpstmtvtdnwixzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcGV2bXBzdG10dnRkbndjeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzc5NTksImV4cCI6MjA3ODk1Mzk1OX0.dtE_FyBWiPMxllsX61Iiza1lPRZcsvEtKGjTiCo7zOc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('Testing login with Admin@test.com...\n');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'Admin@test.com',
      password: 'Password123'
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      console.log('\nAttempting to sign up with password: Password123...');
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: 'Admin@test.com',
        password: 'Password123',
        options: {
          data: {
            full_name: 'Admin User',
            phone: '050-0000000'
          }
        }
      });
      
      if (signupError) {
        console.error('❌ Signup failed:', signupError.message);
      } else {
        console.log('✅ User created successfully!');
        console.log('User ID:', signupData.user?.id);
        console.log('Email:', signupData.user?.email);
        console.log('\n✅ You can now login with:');
        console.log('Email: Admin@test.com');
        console.log('Password: Password123');
      }
    } else {
      console.log('✅ Login successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testLogin().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
