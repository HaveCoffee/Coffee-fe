// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  OtpVerification: { phoneNumber: string };
  Main: undefined;
  Conversation: { conversationId: string };
  CoffeeMatch: { matchId: string };
  ReportAbuse: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CoffeeMatch: { matchId: string; view?: 'profile' | 'chat' };
};

export type ChatStackParamList = {
  Conversation: { id: string; recipientId?: string; recipientName?: string; recipientAvatar?: string };
  CoffeeMatch: { matchId: string; view?: 'profile' | 'chat' };
};

export type DiscoverStackParamList = {
  Discover: undefined;
  CoffeeMatch: { matchId: string; view?: 'profile' | 'chat' };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerification: { phoneNumber: string };
};