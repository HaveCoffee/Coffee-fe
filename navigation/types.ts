// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  OtpVerification: { phoneNumber: string };
  Main: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CoffeeMatch: { userId: string };
};

export type ChatStackParamList = {
  Conversation: { id?: string };
  CoffeeMatch: { userId: string };
};

export type DiscoverStackParamList = {
  Discover: undefined;
  CoffeeMatch: { userId: string };
};