import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import BillsPage from './pages/BillsPage';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import CreateRoomPage from './pages/onboarding/CreateRoomPage';
import JoinRoomPage from './pages/onboarding/JoinRoomPage';
import PendingApprovalPage from './pages/onboarding/PendingApprovalPage';
import { Role, RoomStatus } from './types';
import MealManagementPage from './pages/MealManagementPage';
import ShoppingPage from './pages/ShoppingPage';
import RoomMembersPage from './pages/RoomMembersPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import PaymentDashboardPage from './pages/PaymentDashboardPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { user, page, setPage } = useAuth();

  if (user) {
    // Onboarding and main app logic for authenticated users
    if (user.roomStatus === RoomStatus.NoRoom) {
      if (user.role === Role.Manager) {
        return <CreateRoomPage />;
      }
      return <JoinRoomPage />;
    }

    if (user.roomStatus === RoomStatus.Pending) {
        return <PendingApprovalPage />;
    }

    // User is approved and in a room
    return (
      <Layout>
        {page === 'dashboard' && <DashboardPage />}
        {page.startsWith('bills') && <BillsPage />}
        {page === 'meals' && <MealManagementPage />}
        {page === 'shopping' && <ShoppingPage />}
        {page === 'members' && <RoomMembersPage />}
        {page === 'history' && <HistoryPage />}
        {page === 'reports-analytics' && <ReportsAnalyticsPage />}
        {page === 'payment-dashboard' && <PaymentDashboardPage />}
        {page === 'pending-approvals' && <PendingApprovalsPage />}
        {page === 'settings' && <SettingsPage />}
      </Layout>
    );
  }

  // Public pages for unauthenticated users
  switch (page) {
    case 'login':
      return <LoginPage onNavigateToSignUp={() => setPage('signup')} onNavigateToHome={() => setPage('landing')} />;
    case 'signup':
      return <SignUpPage onNavigateToLogin={() => setPage('login')} />;
    case 'landing':
    default:
      return <LandingPage onNavigateToLogin={() => setPage('login')} onNavigateToSignUp={() => setPage('signup')} />;
  }
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
          <ToastContainer />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
