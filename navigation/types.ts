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
  Plans: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerification: { phoneNumber: string };
};