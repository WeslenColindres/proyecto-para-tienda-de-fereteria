import { useAuth } from '@/features/auth/context/AuthContext';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { AuthenticatedApp } from './AuthenticatedApp';

const App = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
};

export default App;

