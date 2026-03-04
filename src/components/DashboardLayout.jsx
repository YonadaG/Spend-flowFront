import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner variant="fullpage" text="Setting up your workspace..." />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
