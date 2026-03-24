import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import { FaBars } from 'react-icons/fa';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { user, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) {
        return <LoadingSpinner variant="fullpage" text="Setting up your workspace..." />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="dashboard-layout">
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
                <FaBars />
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="sidebar-overlay active" onClick={closeMobileMenu}></div>
            )}

            {/* Sidebar with mobile state */}
            <div className={`sidebar-wrapper ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <Sidebar onLinkClick={closeMobileMenu} />
            </div>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
