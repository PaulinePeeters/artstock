import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { isLoggedIn } from './api';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';

// Chaque page est chargée à la demande pour alléger le bundle initial
const NotificationsDashboard = lazy(() => import('./pages/NotificationsDashboard'));
const Materiel = lazy(() => import('./pages/Materiel'));
const Demandes = lazy(() => import('./pages/Demandes'));
const Preparation = lazy(() => import('./pages/Preparation'));
const Commandes = lazy(() => import('./pages/Commandes'));
const DetailsCommande = lazy(() => import('./pages/DetailsCommande'));
const ReceptionCommande = lazy(() => import('./pages/ReceptionCommande'));
const Fournisseurs = lazy(() => import('./pages/Fournisseurs'));
const DemandesPrix = lazy(() => import('./pages/DemandesPrix'));

function RequireAuth({ children }) {
    if (!isLoggedIn()) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <Router>
            <Suspense fallback={<p style={{ padding: 24 }}>Chargement…</p>}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <RequireAuth>
                                <DashboardLayout />
                            </RequireAuth>
                        }
                    >
                        <Route path="materiel" element={<Materiel />} />
                        <Route path="notifications" element={<NotificationsDashboard />} />
                        <Route path="commandes" element={<Commandes />} />
                        <Route path="/commandes/details/:id" element={<DetailsCommande />} />
                        <Route path="/commandes/reception/:id" element={<ReceptionCommande />} />
                        <Route path="preparation" element={<Preparation />} />
                        <Route path="demandes" element={<Demandes />} />
                        <Route path="fournisseurs" element={<Fournisseurs />} />
                        <Route path="prix" element={<DemandesPrix />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
