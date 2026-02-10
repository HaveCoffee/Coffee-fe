// utils/testCoffeeMlAPIs.ts
import { coffeeMlService } from '../services/coffeeMlService';

export const testCoffeeMlAPIs = async () => {
  console.log('🧪 Testing New Coffee-ML APIs...');
  
  try {
    // Test 1: Get suggested matches
    console.log('1️⃣ Testing getSuggestedMatches...');
    const suggested = await coffeeMlService.getSuggestedMatches();
    console.log('✅ Suggested matches:', suggested);
    
    // Test 2: Get active chats
    console.log('2️⃣ Testing getActiveChats...');
    const active = await coffeeMlService.getActiveChats();
    console.log('✅ Active chats:', active);
    
    // Test 3: Start chat (if we have matches)
    if (suggested.matches && suggested.matches.length > 0) {
      console.log('3️⃣ Testing startChat...');
      const result = await coffeeMlService.startChat(suggested.matches[0].user_id);
      console.log('✅ Start chat result:', result);
    }
    
    console.log('🎉 All Coffee-ML API tests completed!');
    
  } catch (error) {
    console.error('❌ Coffee-ML API test failed:', error);
  }
};