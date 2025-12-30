import ConversationScreen from '../../screens/ConversationScreen';
import { useLocalSearchParams } from 'expo-router';

export default function NewChatScreen() {
  const params = useLocalSearchParams();
  return <ConversationScreen 
    userId={params.userId as string}
    userName={params.name as string}
    userAvatar={params.avatar as string}
  />;
}