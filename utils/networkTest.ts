// utils/networkTest.ts
export const testNetworkConnectivity = async () => {
  try {
    console.log('🌐 Testing network connectivity...');
    
    const response = await fetch('http://3.110.104.45/api/auth/signup/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber: '9876543210' })
    });
    
    const data = await response.json();
    console.log('✅ Network test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Network test failed:', error);
    return { success: false, error: error.message };
  }
};