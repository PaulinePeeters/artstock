import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { logout } from '../api';
import ErrorBoundary from './ErrorBoundary';
import styles from './DashboardLayout.module.css';
import logo from '../assets/logo.png';
import NotificationsDashboard from '../pages/NotificationsDashboard';

export default function DashboardLayout() {
    const location = useLocation();

    const tabs = [
        { key: 'accueil', label: 'Accueil', path: '/' },
        { key: 'materiel', label: 'Matériel', path: '/materiel' },
        { key: 'commandes', label: 'Commandes', path: '/commandes' },
        { key: 'demandes', label: 'Demandes', path: '/demandes' },
        { key: 'preparation', label: 'Préparation', path: '/preparation' },
        { key: 'fournisseurs', label: 'Fournisseurs', path: '/fournisseurs' },
        { key: 'prix', label: 'Demandes de prix', path: '/prix' },
    ];

    const isAccueil = location.pathname === '/';

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <nav className={styles.sidebar}>
                <img src={logo} alt="Logo ArtStock" className={styles.logo} />
                <ul className={styles.navList}>
                    {tabs.map(tab => (
                        <li key={tab.key} className={styles.navItem}>
                            <NavLink
                                to={tab.path}
                                className={({ isActive }) =>
                                    isActive ? styles.navItemActive : undefined
                                }
                                end={tab.key === 'accueil'} // "/" actif uniquement à la racine
                            >
                                {tab.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={logout}
                >
                    <FiLogOut aria-hidden="true" />
                    Déconnexion
                </button>
            </nav>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {isAccueil ? (
                    <>
                        <h1 className={styles.title}>Bienvenue sur ArtStock</h1>
                        <NotificationsDashboard />
                    </>
                ) : (
                    <ErrorBoundary key={location.pathname}>
                        <Outlet />
                    </ErrorBoundary>
                )}
            </main>
        </div>
    );
}
