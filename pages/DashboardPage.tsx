
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import MemberDashboard from '../components/dashboard/MemberDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user.role === Role.Manager ? <ManagerDashboard /> : <MemberDashboard />}
    </div>
  );
};

export default DashboardPage;
