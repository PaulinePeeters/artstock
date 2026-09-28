import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './styles/HistoriqueStock.module.css';

export default function HistoriqueStock({ materiel }) {
    const [historique, setHistorique] = useState([]);

    useEffect(() => {
        if (!materiel) return;

        apiFetch(`/api/materiels/${materiel.id}`)
            .then(res => res.json())
            .then(data => setHistorique(data.historiqueStock || []))
            .catch(err => console.error("Erreur chargement historique :", err));
    }, [materiel]);

    if (!materiel) return <p>Veuillez sélectionner un matériel.</p>;

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(`Historique de ${materiel.nom}`, 14, 15);
        doc.setFontSize(12);
        doc.text(`Date d'export : ${new Date().toLocaleDateString()}`, 14, 25);

        const tableColumn = ["Date", "Type", "Quantité", "Fournisseur", "Prix unitaire", "Commentaire"];
        const tableRows = historique.map(h => ([
            new Date(h.date).toLocaleDateString(),
            h.type,
            h.quantite,
            h.fournisseur || "-",
            h.prixUnitaire ? `${h.prixUnitaire} €` : "-",
            h.commentaire || "-"
        ]));

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: "striped",
        });

        doc.save(`Historique_${materiel.nom}_${new Date().toISOString().slice(0,10)}.pdf`);
    };

    return (
        <div>
            <h2>Historique de {materiel.nom}</h2>

            {historique.length === 0 ? (
                <p>Aucun historique trouvé.</p>
            ) : (
                <>
                    <button className={styles.exportBtn} onClick={handleExportPDF}>
                        Exporter en PDF
                    </button>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Quantité</th>
                                <th>Fournisseur</th>
                                <th>Prix unitaire</th>
                                <th>Commentaire</th>
                            </tr>
                            </thead>
                            <tbody>
                            {historique.map(h => (
                                <tr key={h.id}>
                                    <td>{new Date(h.date).toLocaleDateString()}</td>
                                    <td>{h.type}</td>
                                    <td>{h.quantite}</td>
                                    <td>{h.fournisseur?.nom || '-'}</td>
                                    <td>{h.prixUnitaire ? `${h.prixUnitaire} €` : '-'}</td>
                                    <td>{h.commentaire || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className={styles.cardContainer}>
                            {historique.map(h => (
                                <div key={h.id} className={styles.card}>
                                    <p><strong>Date :</strong> {new Date(h.date).toLocaleDateString()}</p>
                                    <p><strong>Type :</strong> {h.type}</p>
                                    <p><strong>Quantité :</strong> {h.quantite}</p>
                                    <p><strong>Fournisseur :</strong> {h.fournisseur?.nom || '-'}</p>
                                    <p><strong>Prix unitaire :</strong> {h.prixUnitaire ? `${h.prixUnitaire} €` : '-'}</p>
                                    <p><strong>Commentaire :</strong> {h.commentaire || '-'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
