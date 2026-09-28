import React, { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { apiFetch } from '../api';
import { useParams, Link } from 'react-router-dom';
import styles from './styles/DetailsCommande.module.css';

export default function DetailsCommande() {
    const { id } = useParams();
    const [commande, setCommande] = useState(null);

    useEffect(() => {
        const fetchCommande = async () => {
            try {
                const res = await apiFetch(`/api/commandes/${id}`);
                const data = await res.json();
                setCommande(data);
            } catch (err) {
                console.error('Erreur chargement commande :', err);
            }
        };
        fetchCommande();
    }, [id]);

    if (!commande) return <div>Chargement...</div>;

    return (
        <div className={styles.container}>
            <h2>Détails de la commande #{commande.id}</h2>
            <p><strong>Fournisseur :</strong> {commande.fournisseur?.nom || 'N/A'}</p>
            <p><strong>Date de commande :</strong> {new Date(commande.dateCommande).toLocaleDateString()}</p>
            {commande.dateReception && (
                <p><strong>Réceptionnée le :</strong> {new Date(commande.dateReception).toLocaleDateString()}</p>
            )}
            <h3>Matériel commandé :</h3>
            <ul>
                {commande.lignesCommande.map((ligne) => (
                    <li key={ligne.id}>
                        {ligne.materiel.nom} — {ligne.quantite} {ligne.materiel.unite.nom}
                    </li>
                ))}
            </ul>
            <Link to="/commandes"><FiArrowLeft /> Retour</Link>
        </div>
    );
}
