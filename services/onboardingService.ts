// services/onboardingService.ts
import { coffeeMlService } from './coffeeMlService';

export const onboardingService = {
  /**
   * Check if user has completed onboarding by verifying profile exists
   */
  async checkOnboardingStatus(): Promise<boolean> {
    try {
      const profile = await coffeeMlService.getOwnProfile();
      
      // Profile is complete if it has profile_data with meaningful content
      if (!profile?.profile_data) {
        return false;
      }
      
      const hasVibeSummary = Boolean(profile.profile_data.vibe_summary);
      const hasInterests = Boolean(profile.profile_data.interests && profile.profile_data.interests.length > 0);
      
      return hasVibeSummary || hasInterests;
    } catch (error: any) {
      // If profile doesn't exist or endpoint fails, assume incomplete
      console.log('Profile check failed:', error);
      return false;
    }
  },
};