import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProfileModeProvider } from './contexts/ProfileModeContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProfileModeProvider>
          <RouterProvider router={router} fallbackElement={<div />} />
        </ProfileModeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}