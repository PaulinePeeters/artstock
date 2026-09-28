import React from 'react';

// Empêche qu'une erreur JS sur une page ne fasse disparaître tout le tableau
// de bord (sidebar comprise) : seule la zone de contenu affiche un message.
export default class ErrorBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Erreur non gérée dans une page :', error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 24 }}>
                    <h2>Une erreur est survenue sur cette page</h2>
                    <p>Réessaie de la recharger, ou reviens à l'accueil.</p>
                </div>
            );
        }
        return this.props.children;
    }
}
