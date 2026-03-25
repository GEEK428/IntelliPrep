const fs = require('fs');
const path = require('path');

// Rewrite Sidebar.jsx
const sidebarPath = path.join('Frontend', 'src', 'features', 'interview', 'components', 'Sidebar.jsx');
const newSidebar = `import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router"
import { useAuth } from "../../auth/hooks/useAuth"

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { handleLogout } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    
    const onLogout = async () => {
        const result = await handleLogout()
        if (result?.ok) navigate("/login")
    }

    const isActive = (path) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path !== "/" && location.pathname.startsWith(path)) return true;
        return false;
    }

    const navItems = [
        { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
        { path: "/", icon: "analytics", label: "Resume Analysis" },
        { path: "/resume-builder", icon: "edit_document", label: "Resume Builder" },
        { path: "/notes", icon: "book", label: "Notes / Prep Space" },
        { path: "/progress-tracker", icon: "monitoring", label: "Track Your Progress" },
        { path: "/settings", icon: "settings", label: "Settings" },
    ];

    const handleNav = (path) => {
        navigate(path);
        setIsMobileOpen(false);
    }

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="mobile-top-bar">
                <div className="brand-block-mobile">
                    <img className="brand-mark" src="/mind-icon.svg" alt="IntelliPrep logo" onError={(e) => { e.target.style.display = 'none' }} />
                    <h2>IntelliPrep</h2>
                </div>
                <button className="hamburger-btn" onClick={() => setIsMobileOpen(true)}>
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="mobile-sidebar-overlay" onClick={() => setIsMobileOpen(false)}></div>
            )}

            {/* Default Sidebar (Desktop + Mobile Slide-In) */}
            <aside className={\`dashboard-sidebar \${isMobileOpen ? 'open' : ''}\`}>
                <div className="sidebar-header">
                    <div className="brand-block">
                        <img className="brand-mark" src="/mind-icon.svg" alt="IntelliPrep logo" onError={(e) => { e.target.style.display = 'none' }} />
                        <h2>IntelliPrep</h2>
                    </div>
                    <button className="close-sidebar-btn" onClick={() => setIsMobileOpen(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    {navItems.map(item => (
                        <button 
                            key={item.path}
                            className={\`nav-item \${isActive(item.path) ? "nav-item--active" : ""}\`} 
                            type="button" 
                            onClick={() => handleNav(item.path)} 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                
                <div className="sidebar-footer" style={{ marginTop: 'auto', marginBottom: '2rem' }}>
                    <button className="logout-btn" onClick={onLogout} type="button" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>logout</span>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
`;

fs.writeFileSync(sidebarPath, newSidebar);

// Append CSS to home.scss
const scssPath = path.join('Frontend', 'src', 'features', 'interview', 'style', 'home.scss');
let scssContent = fs.readFileSync(scssPath, 'utf8');

const additionalCss = \`
/* ================================================================
   MOBILE RESPONSIVENESS (Top Bar & Hamburger Sidebar)
   ================================================================ */
.mobile-top-bar {
    display: none;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.25rem;
    background: rgba(8, 15, 22, 0.95);
    border-bottom: 1px solid rgba(144, 173, 198, 0.16);
    position: sticky;
    top: 0;
    z-index: 40;
}

.brand-block-mobile {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    h2 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 700;
        color: #eaf2f8;
    }
}

.hamburger-btn, .close-sidebar-btn {
    background: transparent;
    border: none;
    color: #eaf2f8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 0.4rem;
    transition: background 0.2s;
    
    &:hover {
        background: rgba(144, 173, 198, 0.15);
    }
    
    span {
        font-size: 1.8rem;
    }
}

.close-sidebar-btn {
    display: none;
}

.mobile-sidebar-overlay {
    display: none;
}

@media (max-width: 850px) {
    .dashboard-page {
        display: flex;
        flex-direction: column;
    }
    
    .mobile-top-bar {
        display: flex;
    }
    
    .dashboard-sidebar {
        position: fixed;
        left: -100%;
        top: 0;
        bottom: 0;
        width: 280px;
        z-index: 100;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding-top: 1.5rem;
        
        &.open {
            left: 0;
            box-shadow: 10px 0 20px rgba(0,0,0,0.5);
        }
    }
    
    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        
        .brand-block {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
        }
    }
    
    .close-sidebar-btn {
        display: flex;
    }

    .mobile-sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(2px);
        z-index: 90;
    }
    
    .dashboard-main {
        flex: 1;
        padding: 1rem;
    }
}
\`;

if (!scssContent.includes('MOBILE RESPONSIVENESS')) {
    fs.writeFileSync(scssPath, scssContent + additionalCss);
}
console.log("Responsive layout successfully implemented!");
