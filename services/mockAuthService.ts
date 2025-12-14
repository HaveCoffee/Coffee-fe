
// Mock OTP for development
const MOCK_OTP = '123456';

// In-memory store for mock OTPs (for demo purposes - in a real app, use AsyncStorage or similar)
const mockOtpStore: Record<string, string> = {};

export const mockAuthService = {
  // Mock signupInit - simulates sending OTP
  async signupInit(mobileNumber: string) {
    console.log('[MOCK] Sending OTP to:', mobileNumber);
    
    // Store the OTP for verification
    mockOtpStore[mobileNumber] = MOCK_OTP;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      message: 'OTP sent successfully',
      // In development, we'll include the OTP in the response for testing
      ...(process.env.NODE_ENV === 'development' && { debugOtp: MOCK_OTP })
    };
  },

  // Mock verifyOtp - verifies the OTP
  async verifyOtp(mobileNumber: string, otp: string) {
    console.log(`[MOCK] Verifying OTP for ${mobileNumber}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const storedOtp = mockOtpStore[mobileNumber];
    
    if (!storedOtp) {
      throw new Error('No OTP found for this number. Please request a new OTP.');
    }
    
    if (storedOtp !== otp) {
      throw new Error('Invalid OTP. Please try again.');
    }
    
    // Clear the OTP after successful verification
    delete mockOtpStore[mobileNumber];
    
    // Return a mock token
    return {
      success: true,
      token: `mock-jwt-token-${Date.now()}`,
      user: {
        id: 'mock-user-123',
        mobileNumber,
        name: 'Test User'
      }
    };
  },
  
  // Mock login - similar to signup but with user check
  async loginInit(mobileNumber: string) {
    return this.signupInit(mobileNumber);
  },
  
  // Mock login verify
  async loginVerify(mobileNumber: string, otp: string) {
    return this.verifyOtp(mobileNumber, otp);
  },
  
  // Mock signup verify
  async signupVerify(mobileNumber: string, otp: string, password: string) {
    const result = await this.verifyOtp(mobileNumber, otp);
    // In a real app, you would create a new user here
    return {
      ...result,
      user: {
        ...result.user,
        // Add any additional user fields for signup
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      }
    };
  },
  
  // Mock getProfile
  async getProfile(token: string) {
    // In a real app, you would validate the token and fetch the user
    return {
      id: 'mock-user-123',
      mobileNumber: '+919999999999',
      name: 'Test User',
      email: 'test@example.com'
    };
  }
};

export default mockAuthService;
