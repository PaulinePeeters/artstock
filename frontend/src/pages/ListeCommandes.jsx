// pages/commandes/ListeCommandes.js
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiSearch, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { apiFetch } from '../api';
import styles from './styles/ListeCommandes.module.css';

// Année scolaire d'une date : de septembre à août (ex: "2025-2026")
const anneeScolaire = (date) => {
    const d = new Date(date);
    const annee = d.getFullYear();
    return d.getMonth() >= 8 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`;
};

export default function ListeCommandes({ onReception, onDetails }) {
    const [commandes, setCommandes] = useState([]);
    const anneeActuelle = anneeScolaire(new Date());
    const [anneeSelectionnee, setAnneeSelectionnee] = useState(anneeActuelle);

    useEffect(() => {
        fetchCommandes();
    }, []);

    const fetchCommandes = async () => {
        try {
            const res = await apiFetch(`/api/commandes`);
            const data = await res.json();
            setCommandes(data);
        } catch (err) {
            console.error('Erreur chargement commandes :', err);
        }
    };

    const handleDelete = async (commande) => {
        if (!window.confirm(`Supprimer la commande #${commande.id} ? Cette action est irréversible.`)) return;
        try {
            const res = await apiFetch(`/api/commandes/${commande.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Erreur suppression');
            }
            await fetchCommandes();
        } catch (err) {
            alert(err.message || 'Erreur lors de la suppression de la commande');
        }
    };

    const genererPDFSuivi = async (commande) => {
        try {
            const res = await apiFetch(`/api/commandes/${commande.id}`);
            const details = await res.json(); // Doit contenir les lignes de commande
            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text(`Suivi commande #${commande.id}`, 14, 20);
            doc.setFontSize(12);
            doc.text(`Fournisseur : ${commande.fournisseur?.nom || 'N/A'}`, 14, 30);
            doc.text(`Date de commande : ${new Date(commande.dateCommande).toLocaleDateString()}`, 14, 37);

            autoTable(doc, {
                startY: 45,
                head: [['Article', 'Quantité', 'Prix unitaire']],
                body: details.lignesCommande.map(l => [
                    l.materiel?.nom || 'N/A',
                    l.quantite,
                    `${l.prixUnitaire?.toFixed(2)} €`,
                ])
            });

            doc.text("Message :", 14, doc.lastAutoTable.finalY + 10);
            const startY = doc.lastAutoTable.finalY + 17;
            doc.text("Bonjour,", 14, startY);
            doc.text("Pourriez-vous nous confirmer la date de livraison prévue pour cette commande ?", 14, startY + 7);
            doc.text("Cordialement,", 14, startY + 14);


            doc.save(`Suivi_Commande_${commande.id}.pdf`);
        } catch (err) {
            console.error("Erreur lors de la génération du PDF :", err);
        }
    };

    // Années disponibles dans les données (toujours inclure l'année scolaire en cours)
    const anneesDisponibles = Array.from(
        new Set([anneeActuelle, ...commandes.map(c => anneeScolaire(c.dateCommande))])
    ).sort().reverse();

    const commandesFiltrees = commandes.filter(
        c => anneeScolaire(c.dateCommande) === anneeSelectionnee
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Liste des commandes</h2>
                <select
                    className={styles.selectAnnee}
                    value={anneeSelectionnee}
                    onChange={e => setAnneeSelectionnee(e.target.value)}
                >
                    {anneesDisponibles.map(annee => (
                        <option key={annee} value={annee}>Année {annee}</option>
                    ))}
                </select>
            </div>

            {commandesFiltrees.length === 0 ? (
                <p className={styles.empty}>Aucune commande pour l'année {anneeSelectionnee}.</p>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Fournisseur</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {commandesFiltrees.map((commande) => (
                            <tr key={commande.id}>
                                <td>{commande.id}</td>
                                <td>{commande.fournisseur?.nom || 'N/A'}</td>
                                <td>{new Date(commande.dateCommande).toLocaleDateString()}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.btnDetails}
                                            onClick={() => onDetails(commande)}
                                        >
                                            <FiSearch /> Détails
                                        </button>
                                        <button
                                            className={styles.btnSuivi}
                                            onClick={() => genererPDFSuivi(commande)}
                                        >
                                            Suivi
                                        </button>
                                        {commande.dateReception ? (
                                            <span className={styles.receptionne}><FiCheckCircle /> Réceptionné</span>
                                        ) : (
                                            <>
                                                <button
                                                    className={styles.btnReception}
                                                    onClick={() => onReception(commande)}
                                                >
                                                    Réceptionner
                                                </button>
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={() => handleDelete(commande)}
                                                    title="Supprimer la commande"
                                                >
                                                    <FiTrash2 /> Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {/* Cartes sur tablette/mobile */}
                    {commandesFiltrees.map((commande) => (
                        <div key={commande.id} className={styles.cardCommande}>
                            <h3>Commande #{commande.id}</h3>
                            <p><strong>Fournisseur :</strong> {commande.fournisseur?.nom || 'N/A'}</p>
                            <p><strong>Date :</strong> {new Date(commande.dateCommande).toLocaleDateString()}</p>
                            <div className={styles.actions}>
                                <button className={styles.btnDetails} onClick={() => onDetails(commande)}><FiSearch /> Détails</button>
                                <button className={styles.btnSuivi} onClick={() => genererPDFSuivi(commande)}>Suivi</button>
                                {commande.dateReception ? (
                                    <span className={styles.receptionne}><FiCheckCircle /> Réceptionné</span>
                                ) : (
                                    <>
                                        <button className={styles.btnReception} onClick={() => onReception(commande)}>Réceptionner</button>
                                        <button className={styles.btnDelete} onClick={() => handleDelete(commande)} title="Supprimer la commande">
                                            <FiTrash2 /> Supprimer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
