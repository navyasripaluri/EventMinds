import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, FileText, Calendar, Palette, DollarSign } from 'lucide-react';
import VendorSearch from './pages/VendorSearch';
import ContractAnalyzer from './pages/ContractAnalyzer';
import ScheduleBuilder from './pages/ScheduleBuilder';
import ThemeCreator from './pages/ThemeCreator';
import BudgetPlanner from './pages/BudgetPlanner';
import FinalPlan from './pages/FinalPlan';
import { EventProvider } from './context/EventContext';
import './index.css';

function Navigation() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Search, label: 'Vendor Search' },
        { path: '/contract', icon: FileText, label: 'Contract Analyzer' },
        { path: '/schedule', icon: Calendar, label: 'Schedule Builder' },
        { path: '/theme', icon: Palette, label: 'Theme Creator' },
        { path: '/budget', icon: DollarSign, label: 'Budget Planner' },
    ];

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.navContainer}>
                <div style={styles.logo}>
                    <Sparkles size={32} color="var(--primary)" />
                    <h2 style={styles.logoText}>EventMinds</h2>
                </div>
                <div style={styles.navLinks}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...styles.navLink,
                                    ...(isActive ? styles.navLinkActive : {})
                                }}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

function App() {
    return (
        <Router>
            <EventProvider>
                <div style={styles.app}>
                    <Navigation />
                    <main style={styles.main}>
                        <Routes>
                            <Route path="/" element={<VendorSearch />} />
                            <Route path="/contract" element={<ContractAnalyzer />} />
                            <Route path="/schedule" element={<ScheduleBuilder />} />
                            <Route path="/theme" element={<ThemeCreator />} />
                            <Route path="/budget" element={<BudgetPlanner />} />
                            <Route path="/final-plan" element={<FinalPlan />} />
                        </Routes>
                    </main>
                </div>
            </EventProvider>
        </Router>
    );
}

const styles = {
    app: {
        minHeight: '100vh',
    },
    nav: {
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
    },
    navContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    logoText: {
        margin: 0,
        background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '1.75rem',
    },
    navLinks: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        transition: 'all var(--transition-base)',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    navLinkActive: {
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
    },
    main: {
        padding: '2rem 0',
        minHeight: 'calc(100vh - 100px)',
    },
};

export default App;
