// utils/testCoffeeMlWithToken.ts
import { coffeeMlApiRequest } from './api';

const HARDCODED_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MWQyYmU2NTZhNzA0NTE1NTA1YzA0MDYwY2MzYWQ4ZSIsImlhdCI6MTc2ODMzMjMwNywiZXhwIjoxNzY4NTA1MTA3fQ.-HvSe42YOtsWuJ5ex-hrtJScW4x6ZpL-_Qq6YIPVuzQ';

export const testCoffeeMlWithHardcodedToken = async () => {
  console.log('🧪 Testing Coffee-ML APIs with hardcoded token...');
  
  try {
    // Test 1: Get profile
    console.log('1️⃣ Testing Coffee-ML profile...');
    const profile = await coffeeMlApiRequest('/api/profile', 'GET', null, HARDCODED_JWT);
    console.log('✅ Coffee-ML Profile:', profile);
    
    // Test 2: Get suggested matches
    console.log('2️⃣ Testing Coffee-ML suggested matches...');
    const suggested = await coffeeMlApiRequest('/api/matches/suggested', 'GET', null, HARDCODED_JWT);
    console.log('✅ Coffee-ML Suggested:', suggested);
    
    // Test 3: Get active chats
    console.log('3️⃣ Testing Coffee-ML active chats...');
    const active = await coffeeMlApiRequest('/api/matches/active', 'GET', null, HARDCODED_JWT);
    console.log('✅ Coffee-ML Active:', active);
    
    // Test 4: Chat with Ella
    console.log('4️⃣ Testing Coffee-ML chat...');
    const chat = await coffeeMlApiRequest('/chat', 'POST', {
      message: 'Hello Ella!',
      thread_id: ''
    }, HARDCODED_JWT);
    console.log('✅ Coffee-ML Chat:', chat);
    
    console.log('🎉 All Coffee-ML tests completed!');
    
  } catch (error) {
    console.error('❌ Coffee-ML test failed:', error);
  }
};