import React, { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { apiFetch } from '../api';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import styles from './styles/DemandesPrix.module.css';

export default function DemandePrix() {
    const [lignes, setLignes] = useState([{ materielId: '', quantite: 1 }]);
    const [materiels, setMateriels] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [fournisseurSelectionne, setFournisseurSelectionne] = useState('');

    useEffect(() => {
        apiFetch(`/api/materiels`)
            .then(res => res.json())
            .then(data => setMateriels(data));
    }, []);

    useEffect(() => {
        apiFetch(`/api/fournisseurs`)
            .then(res => res.json())
            .then(data => setFournisseurs(Array.isArray(data) ? data : []))
            .catch(() => setFournisseurs([]));
    }, []);

    // Code de l'article chez le fournisseur sélectionné, s'il existe
    const codeArticlePourLigne = (materielId) => {
        if (!fournisseurSelectionne || !materielId) return null;
        const materiel = materiels.find(m => m.id.toString() === materielId.toString());
        const lien = materiel?.fournisseurs?.find(
            f => f.fournisseurId.toString() === fournisseurSelectionne.toString()
        );
        return lien?.codeArticle || null;
    };

    const ajouterLigne = () => setLignes([...lignes, { materielId: '', quantite: 1 }]);

    const supprimerLigne = (i) => {
        setLignes(lignes.filter((_, idx) => idx !== i));
    };

    const modifierLigne = (i, field, value) => {
        const newLignes = [...lignes];
        newLignes[i][field] = value;
        setLignes(newLignes);
    };

    const exporterPDF = () => {
        const doc = new jsPDF();
        const fournisseur = fournisseurs.find(f => f.id.toString() === fournisseurSelectionne);

        doc.setFontSize(18);
        doc.text('Institut Ste Marie', 14, 15);
        doc.setFontSize(12);
        doc.text('Demande de prix', 14, 25);
        if (fournisseur) {
            doc.text(`Fournisseur : ${fournisseur.nom}`, 14, 32);
            doc.text(`Date : ${new Date().toLocaleDateString()}`, 14, 39);
            doc.text('Merci de nous communiquer vos tarifs pour les articles suivants.', 14, 47);
        } else {
            doc.text(`Date : ${new Date().toLocaleDateString()}`, 14, 32);
            doc.text('Merci de nous communiquer vos tarifs pour les articles suivants.', 14, 40);
        }

        const tableColumn = ["Matériel", "Réf. fournisseur", "Quantité", "Prix unitaire", "Unité de vente"];
        const tableRows = [];

        lignes.forEach(ligne => {
            const materiel = materiels.find(m => m.id.toString() === ligne.materielId);
            tableRows.push([
                materiel ? materiel.nom : '',
                codeArticlePourLigne(ligne.materielId) || '—',
                ligne.quantite,
                '—',
                '—',
            ]);
        });

        autoTable(doc, {
            startY: fournisseur ? 55 : 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
        });

        doc.save(`Demande_de_prix_${new Date().toISOString().slice(0,10)}.pdf`);
    };

    return (
        <div className={styles.container}>
            <h1>Demande de prix</h1>

            <label className={styles.fournisseurLabel}>
                Fournisseur (optionnel, pour afficher vos références chez lui)
                <select
                    className={styles.select}
                    value={fournisseurSelectionne}
                    onChange={e => setFournisseurSelectionne(e.target.value)}
                >
                    <option value="">-- Aucun --</option>
                    {fournisseurs.map(f => (
                        <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                </select>
            </label>

            {lignes.map((ligne, i) => (
                <div key={i} className={styles.ligne}>
                    <select
                        className={styles.select}
                        value={ligne.materielId}
                        onChange={e => modifierLigne(i, 'materielId', e.target.value)}
                        required
                    >
                        <option value="">-- Sélectionner matériel --</option>
                        {materiels.map(m => (
                            <option key={m.id} value={m.id}>{m.nom}</option>
                        ))}
                    </select>

                    {fournisseurSelectionne && (
                        <span className={styles.refFournisseur}>
                            Réf. : {codeArticlePourLigne(ligne.materielId) || '—'}
                        </span>
                    )}

                    <input
                        className={styles.input}
                        type="number"
                        min="1"
                        value={ligne.quantite}
                        onChange={e => modifierLigne(i, 'quantite', e.target.value)}
                        required
                    />

                    <button
                        className={styles.btnSupprimer}
                        type="button"
                        onClick={() => supprimerLigne(i)}
                    >
                        <FiX />
                    </button>
                </div>
            ))}

            <div className={styles.actions}>
                <button type="button" className={styles.btnAjouter} onClick={ajouterLigne}>
                    <FiPlus /> Ajouter un matériel
                </button>

                <button type="button" className={styles.btnExporter} onClick={exporterPDF}>
                    Exporter en PDF
                </button>
            </div>
        </div>
    );
}
