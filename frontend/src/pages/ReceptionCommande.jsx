import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles/ReceptionCommande.module.css';

export default function ReceptionCommande() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [commande, setCommande] = useState(null);
    const [lignes, setLignes] = useState([]);

    useEffect(() => {
        async function fetchDetails() {
            const res = await apiFetch(`/api/commandes/${id}`);
            const data = await res.json();
            setCommande(data);
            setLignes(data.lignesCommande.map(l => ({
                ...l,
                quantiteRecue: l.quantite,
                prixUnitaireRecu: l.prixUnitaire
            })));
        }
        fetchDetails();
    }, [id]);

    if (!commande) return <div>Chargement...</div>;

    const handleChange = (index, field, value) => {
        const updated = [...lignes];
        updated[index][field] = value;
        setLignes(updated);
    };

    const handleReception = async () => {
        const reception = lignes.map(l => ({
            ligneCommandeId: l.id,
            quantiteRecue: Number(l.quantiteRecue),
            prixUnitaire: Number(l.prixUnitaireRecu)
        }));

        await apiFetch(`/api/commandes/${id}/reception`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reception })
        });

        navigate('/commandes'); // revient à la liste
    };

    return (
        <div className={styles.container}>
            <h2>Réception de la commande #{commande.id}</h2>
            <p>Fournisseur : <strong>{commande.fournisseur?.nom || 'N/A'}</strong></p>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Matériel</th>
                    <th>Commandé</th>
                    <th>Reçu</th>
                    <th>Prix / u</th>
                    <th>Prix reçu</th>
                </tr>
                </thead>
                <tbody>
                {lignes.map((ligne, i) => (
                    <tr key={ligne.id}>
                        <td>{ligne.materiel.nom}</td>
                        <td>{ligne.quantite}</td>
                        <td>
                            <input
                                type="number"
                                value={ligne.quantiteRecue}
                                onChange={(e) => handleChange(i, 'quantiteRecue', e.target.value)}
                            />
                        </td>
                        <td>{ligne.prixUnitaire} €</td>
                        <td>
                            <input
                                type="number"
                                value={ligne.prixUnitaireRecu}
                                onChange={(e) => handleChange(i, 'prixUnitaireRecu', e.target.value)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className={styles.actions}>
                <button onClick={() => navigate('/commandes')}>Annuler</button>
                <button onClick={handleReception}>Valider la réception</button>
            </div>
        </div>
    );
}
