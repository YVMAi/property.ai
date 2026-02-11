import { useLocation, useNavigate } from 'react-router-dom';
import DashboardAIChat from '@/components/dashboard/DashboardAIChat';

export default function AIChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = (location.state as any)?.initialMessage as string | undefined;

  return (
    <DashboardAIChat
      initialMessage={initialMessage}
      onBack={() => navigate('/dashboard')}
    />
  );
}
