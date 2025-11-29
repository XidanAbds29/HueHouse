'use client';

import { useState, useEffect } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLogin from '@/components/AdminLogin';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('admin_session');
        if (session === 'true') {
            setIsAuthenticated(true);
        }
        setChecking(false);
    }, []);

    if (checking) return null;

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    return <AdminDashboard />;
}
