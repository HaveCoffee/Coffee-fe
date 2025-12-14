// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { matchId: string };
  Profile: undefined;
  EditProfile: undefined;
  ReportAbuse: undefined;
  CoffeeMatch: { matchId: string };
  Conversation: { conversationId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Plans: undefined;
  Profile: undefined;
};