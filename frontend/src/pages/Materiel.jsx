import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import GestionStock from './GestionStock';
import FormulaireMateriel from './FormulaireMateriel';
import HistoriqueStock from './HistoriqueStock';
import styles from './styles/Materiel.module.css';

export default function Materiel() {
    const [onglet, setOnglet] = useState('gestion');
    const [materielSelected, setMaterielSelected] = useState(null);
    const [formMode, setFormMode] = useState('ajout');
    const [unites, setUnites] = useState([]);
    const [materiels, setMateriels] = useState([]);

    // Charger les matériels (gestion & historique)
    const fetchMateriels = () => {
        apiFetch(`/api/materiels`)
            .then(res => res.json())
            .then(data => {
                //Tri alphabétique par nom (en tenant compte des accents)
                const sortedData = [...data].sort((a, b) =>
                    a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
                );
                setMateriels(sortedData);
            })
            .catch(err => console.error("Erreur lors du chargement des matériels :", err));
    };

    const fetchUnites = () => {
        apiFetch(`/api/unites`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)){
                    setUnites(data);
                }else{
                    console.error("Les unités reçues ne sont pas un tableau :", data);
                    setUnites([]);
                }
            })
            .catch(err => {
                console.error("Erreur chargement unités :", err);
                setUnites([]);
            });
    };


    useEffect(() => {
        fetchMateriels();
        fetchUnites();
    }, []);

    const handleEdit = (materiel) => {
        setMaterielSelected(materiel);
        setFormMode('modif');
        setOnglet('form');
    };

    const handleViewHistorique = (materiel) => {
        setMaterielSelected(materiel);
        setOnglet('historique');
    };

    const handleAdd = () => {
        setMaterielSelected(null);
        setFormMode('ajout');
        setOnglet('form');
    };

    const handleDoneFormulaire = () => {
        setOnglet('gestion');
        fetchMateriels();
    };

    return (
        <div className={styles.container}>
            <h1>Gestion du matériel et du stock</h1>
            <nav className={styles.tabs}>
                <button onClick={() => setOnglet('gestion')}
                        className={onglet === 'gestion' ? styles.active : ''}>Gestion stock
                </button>
                <button onClick={() => setOnglet('form')} className={onglet === 'form' ? styles.active : ''}>Ajouter /
                    Modifier
                </button>
                <button onClick={() => setOnglet('historique')}
                        className={onglet === 'historique' ? styles.active : ''}>Historique stock
                </button>
            </nav>

            <section className={styles.content}>
                {onglet === 'gestion' &&
                    <GestionStock
                        materiels={materiels}
                        onEdit={handleEdit}
                        onViewHistorique={handleViewHistorique}
                        onAdd={handleAdd}
                    />}
                {onglet === 'form' &&
                    <FormulaireMateriel
                        materiel={materielSelected}
                        mode={formMode}
                        unites={unites}
                        onDone={handleDoneFormulaire}
                    />}
                {onglet === 'historique' &&
                    <HistoriqueStock materiel={materielSelected}/>}

            </section>
        </div>
    );
}
