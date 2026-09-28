import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiAlertCircle, FiCheck, FiX, FiPlus, FiMinus, FiEdit2, FiClock, FiTrash2, FiSearch } from 'react-icons/fi';
import styles from './styles/GestionStock.module.css';

export default function GestionStock({ onEdit, onViewHistorique, onAdd }) {
    const [materiels, setMateriels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStockId, setEditingStockId] = useState(null);
    const [stockDelta, setStockDelta] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [recherche, setRecherche] = useState('');

    useEffect(() => {
        fetchMateriels();
    }, []);

    const fetchMateriels = async () => {
        try {
            setLoading(true);
            const res = await apiFetch(`/api/materiels`);
            if (!res.ok) throw new Error('Erreur réseau');
            const data = await res.json();
            setMateriels(data);
        } catch (err) {
            console.error("Erreur lors du chargement des matériels :", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Export du stock de matériel', 14, 15);
        doc.setFontSize(12);
        doc.text(`Date : ${new Date().toLocaleDateString()}`, 14, 25);

        const tableColumn = ["Nom", "Quantité en stock", "Unité", "Seuil d'alerte"];
        const tableRows = materiels.map(item => ([
            item.nom,
            item.stockReel,
            item.unite?.nom || '–',
            item.seuilAlerte ?? '–'
        ]));

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
        });

        doc.save(`Stock_materiels_${new Date().toISOString().slice(0,10)}.pdf`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Confirmer la suppression de cet article ?")) return;
        try {
            const res = await apiFetch(`/api/materiels/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Échec de la suppression");
            await fetchMateriels();
        } catch (err) {
            console.error("Erreur suppression :", err);
        }
    };

    const handleUpdateStock = async (id, delta, commentaire) => {
        try {
            const res = await apiFetch(`/api/materiels/${id}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta: Number(delta),
                commentaire
                })
            });
            if (!res.ok) throw new Error("Échec de la mise à jour du stock");
            setEditingStockId(null);
            setStockDelta('');
            setCommentaire('');
            await fetchMateriels();
        } catch (err) {
            console.error("Erreur mise à jour stock :", err);
        }
    };

    // Comparaison insensible à la casse et aux accents
    const normaliser = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const materielsAffiches = recherche
        ? materiels.filter(m => normaliser(m.nom).includes(normaliser(recherche)))
        : materiels;

    // Actions partagées entre la vue tableau (desktop) et la vue cartes (mobile)
    const renderActions = (item) => {
        const isEditing = editingStockId === item.id;
        return isEditing ? (
            <>
                <input
                    type="number"
                    value={stockDelta}
                    onChange={(e) => setStockDelta(e.target.value)}
                    className={styles.stockInput}
                    placeholder="Quantité"
                />
                <input
                    type="text"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    className={styles.commentaireInput}
                    placeholder="Commentaire"
                />
                <button onClick={() => handleUpdateStock(item.id, stockDelta, commentaire)} title="Valider">
                    <FiCheck />
                </button>
                <button
                    onClick={() => {
                        setEditingStockId(null);
                        setStockDelta('');
                        setCommentaire('');
                    }}
                    title="Annuler"
                >
                    <FiX />
                </button>
            </>
        ) : (
            <>
                <button title="Ajouter du stock" onClick={() => {
                    setEditingStockId(item.id);
                    setStockDelta('');
                }}><FiPlus /></button>
                <button title="Retirer du stock" onClick={() => {
                    setEditingStockId(item.id);
                    setStockDelta('-');
                }}><FiMinus /></button>
                <button title="Modifier" onClick={() => onEdit(item)}><FiEdit2 /></button>
                <button title="Historique" onClick={() => onViewHistorique(item)}><FiClock /></button>
                <button title="Supprimer" onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
            </>
        );
    };

    const materielsTries = materielsAffiches
        .slice()
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Matériel en stock</h2>
                <button className={styles.exportBtn} onClick={handleExport}>
                    Exporter PDF
                </button>
            </div>

            <div className={styles.searchBar}>
                <FiSearch aria-hidden="true" />
                <input
                    type="search"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Rechercher un matériel…"
                />
            </div>

            {loading && <p className={styles.loading}>Chargement...</p>}
            {!loading && materielsAffiches.length === 0 && (
                <p className={styles.empty}>Aucun matériel trouvé.</p>
            )}

            {!loading && materielsAffiches.length > 0 && (
                <>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Quantité</th>
                            <th>Unité</th>
                            <th>Seuil</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {materielsTries.map(item => {
                            const alerte = item.stockReel <= item.seuilAlerte;
                            return (
                                <tr key={item.id}>
                                    <td>
                                        {alerte && <FiAlertCircle className={styles.alertePastille} title="Stock sous le seuil d'alerte" />}
                                        {item.nom}
                                    </td>
                                    <td>{item.stockReel}</td>
                                    <td>{item.unite?.nom || '–'}</td>
                                    <td>{item.seuilAlerte ?? '–'}</td>
                                    <td className={styles.actions}>{renderActions(item)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {/* Vue cartes : tablette et mobile */}
                    <div className={styles.cardContainer}>
                        {materielsTries.map(item => {
                            const alerte = item.stockReel <= item.seuilAlerte;
                            return (
                                <div key={item.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.cardNom}>
                                            {alerte && <FiAlertCircle className={styles.alertePastille} title="Stock sous le seuil d'alerte" />}
                                            {item.nom}
                                        </span>
                                    </div>
                                    <div className={styles.cardInfos}>
                                        <span><strong>Quantité :</strong> {item.stockReel} {item.unite?.nom || ''}</span>
                                        <span><strong>Seuil :</strong> {item.seuilAlerte ?? '–'}</span>
                                    </div>
                                    <div className={styles.actions}>{renderActions(item)}</div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
