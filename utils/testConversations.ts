// utils/testConversations.ts
import { conversationService } from '../services/conversationService';

export const testConversationAPIs = async () => {
  console.log('🧪 Testing Conversation APIs...');
  
  try {
    // Test 1: Get user profile
    console.log('1️⃣ Testing getUserProfile...');
    const profile = await conversationService.getUserProfile();
    console.log('✅ Profile:', profile);
    
    // Test 2: Get messages (should be empty initially)
    console.log('2️⃣ Testing getChatMessages...');
    const messages = await conversationService.getChatMessages('test-user-id');
    console.log('✅ Messages:', messages);
    
    // Test 3: Send a test message
    console.log('3️⃣ Testing sendMessage...');
    const sentMessage = await conversationService.sendMessage('test-user-id', 'Hello from test!');
    console.log('✅ Sent message:', sentMessage);
    
    // Test 4: Get conversations list
    console.log('4️⃣ Testing getConversations...');
    const conversations = await conversationService.getConversations();
    console.log('✅ Conversations:', conversations);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};