// pages/GestionCommandes.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListeCommandes from './ListeCommandes';
import AjouterCommande from './AjouterCommande';
import ReceptionCommande from './ReceptionCommande';
import styles from './styles/Commandes.module.css';

export default function Commandes() {
    const [ongletActif, setOngletActif] = useState('liste');
    const [commandeARecevoir, setCommandeARecevoir] = useState(null);
    const navigate = useNavigate();


    const handleAjoutCommande = () => {
        setOngletActif('liste');
    };

    return (
        <div className={styles.container}>
            <h1>Gestion des commandes</h1>
            <div className={styles.onglets}>
                <button
                    onClick={() => setOngletActif('liste')}
                    className={ongletActif === 'liste' ? styles.active : ''}
                >
                    Liste
                </button>
                <button
                    onClick={() => setOngletActif('ajouter')}
                    className={ongletActif === 'ajouter' ? styles.active : ''}
                >
                    Nouvelle
                </button>
            </div>


            <div className={styles.contenu}>
                {ongletActif === 'liste' && (
                    <ListeCommandes
                        onReception={(commande) => navigate(`/commandes/reception/${commande.id}`)}
                        onDetails={(commande) => navigate(`/commandes/details/${commande.id}`)}
                    />
                )}

                {ongletActif === 'ajouter' && (
                    <AjouterCommande onAjout={handleAjoutCommande}/>
                )}
                {ongletActif === 'reception' && commandeARecevoir && (
                    <ReceptionCommande commande={commandeARecevoir} retour={() => setOngletActif('liste')}/>
                )}
            </div>
        </div>
    );
}
