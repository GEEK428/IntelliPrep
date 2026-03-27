import React from 'react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../../auth/hooks/useAuth';

const TopBar = () => {
    const { user } = useAuth();
    return (
        <header className="dashboard-header top-bar" style={{ justifyContent: 'flex-end' }}>
            <div className="top-bar-right" style={{ gap: '1.5rem' }}>
                <NotificationBell />
                <div className="user-profile-badge">
                    <img className="user-avatar" src="/default-avatar.png" alt="User" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<div class=\"avatar-fallback\"><span class=\"material-symbols-outlined\">person</span></div>' }} />
                    {(user?.fullName || user?.username) && (
                        <div className="user-info">
                            <span className="user-name">{user?.fullName || user?.username}</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
