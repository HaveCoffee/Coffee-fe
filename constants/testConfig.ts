// constants/testConfig.ts
export const TEST_CONFIG = {
  // Set to true when you want to test with real OTP
  ENABLE_REAL_OTP: false,
  
  // Test phone numbers that work in dev mode
  TEST_NUMBERS: [
    '1234567890',
    '9876543210', 
    '8765432109'
  ],
  
  // Valid OTP for dev mode (any 6 digits work)
  DEV_OTP: '123456',
  
  // Real OTP testing instructions
  REAL_OTP_INSTRUCTIONS: `
    To test with real OTP:
    1. Ask backend dev to disable dev mode
    2. Configure SMS provider (Twilio/AWS SNS)
    3. Set ENABLE_REAL_OTP to true
    4. Use your real mobile number
    5. Enter actual OTP from SMS
  `
};