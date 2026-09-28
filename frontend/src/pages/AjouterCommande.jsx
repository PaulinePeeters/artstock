import React, { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { apiFetch } from '../api';
import styles from './styles/AjouterCommande.module.css';

export default function AjouterCommande({ onAjout }) {
    // Liste des fournisseurs
    const [fournisseurs, setFournisseurs] = useState([]);
    // Valeur sélectionnée (id du fournisseur)
    const [fournisseurSelectionne, setFournisseurSelectionne] = useState('');

    const [dateCommande, setDateCommande] = useState('');
    const [materiels, setMateriels] = useState([]);
    const [lignes, setLignes] = useState([]);

    useEffect(() => {
        apiFetch(`/api/materiels`)
            .then(res => res.json())
            .then(data => setMateriels(data))
            .catch(err => console.error('Erreur chargement matériels :', err));
    }, []);

    useEffect(() => {
        apiFetch(`/api/fournisseurs`)
            .then(res => res.json())
            .then(data => setFournisseurs(data))
            .catch(err => console.error('Erreur chargement fournisseurs :', err));
    }, []);

    const ajouterLigne = () => {
        setLignes([...lignes, { materielId: '', quantite: 1, prixUnitaire: 0 }]);
    };

    // Code de l'article chez le fournisseur sélectionné, s'il existe
    const codeArticlePourLigne = (materielId) => {
        if (!fournisseurSelectionne || !materielId) return null;
        const materiel = materiels.find(m => m.id.toString() === materielId.toString());
        const lien = materiel?.fournisseurs?.find(
            f => f.fournisseurId.toString() === fournisseurSelectionne.toString()
        );
        return lien?.codeArticle || null;
    };

    const modifierLigne = (i, champ, valeur) => {
        const copy = [...lignes];
        copy[i][champ] = champ === 'quantite' || champ === 'prixUnitaire' ? Number(valeur) : valeur;
        setLignes(copy);
    };

    const supprimerLigne = (i) => {
        const copy = [...lignes];
        copy.splice(i, 1);
        setLignes(copy);
    };

    const enregistrerCommande = async () => {
        if (!fournisseurSelectionne) {
            alert('Veuillez choisir un fournisseur.');
            return;
        }
        const commande = {
            fournisseur: Number(fournisseurSelectionne),
            dateCommande,
            lignes
        };

        const res = await apiFetch(`/api/commandes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commande)
        });

        if (res.ok) {
            onAjout(); // revient à la liste
        } else {
            console.error('Erreur lors de l’enregistrement');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Nouvelle commande</h2>
            <div className={styles.form}>
                <label>Fournisseur :</label>
                <select
                    value={fournisseurSelectionne}
                    onChange={e => setFournisseurSelectionne(e.target.value)}
                >
                    <option value="">-- Choisir un fournisseur --</option>
                    {Array.isArray(fournisseurs) && fournisseurs.map(f => (
                        <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                </select>

                <label>Date :</label>
                <input
                    type="date"
                    value={dateCommande}
                    onChange={e => setDateCommande(e.target.value)}
                />
            </div>

            <h3>Lignes de commande</h3>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Matériel</th>
                    {fournisseurSelectionne && <th>Réf. fournisseur</th>}
                    <th>Quantité</th>
                    <th>Prix unitaire (€)</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {lignes.map((ligne, i) => (
                    <tr key={i}>
                        <td>
                            <select
                                value={ligne.materielId}
                                onChange={e => modifierLigne(i, 'materielId', e.target.value)}
                            >
                                <option value="">-- Choisir --</option>
                                {materiels.map(m => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                ))}
                            </select>
                        </td>
                        {fournisseurSelectionne && (
                            <td className={styles.refFournisseur}>
                                {codeArticlePourLigne(ligne.materielId) || '—'}
                            </td>
                        )}
                        <td>
                            <input
                                type="number"
                                value={ligne.quantite}
                                min="1"
                                onChange={e => modifierLigne(i, 'quantite', e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value={ligne.prixUnitaire}
                                min="0"
                                step="0.01"
                                onChange={e => modifierLigne(i, 'prixUnitaire', e.target.value)}
                            />
                        </td>
                        <td><button onClick={() => supprimerLigne(i)} title="Supprimer"><FiX /></button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button className={styles.btAdd} onClick={ajouterLigne}><FiPlus /> Ajouter une ligne</button>

            <div className={styles.actions}>
                <button onClick={onAjout}>Annuler</button>
                <button onClick={enregistrerCommande}>Enregistrer</button>
            </div>
        </div>
    );
}
