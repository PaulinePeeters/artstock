import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import styles from './styles/Demandes.module.css';

export default function GestionDemandes() {
    const [activeTab, setActiveTab] = useState('liste');
    const [demandes, setDemandes] = useState([]);
    const [materiels, setMateriels] = useState([]);
    const [formData, setFormData] = useState({
        nomProf: '',
        classe: '',
        dateUtilisation: '',
        commentaire: '',
        lignes: [],
    });

    useEffect(() => {
        fetchDemandes();
        apiFetch(`/api/materiels`)
            .then(res => res.json())
            .then(data => setMateriels(data));
    }, []);

    const fetchDemandes = () => {
        apiFetch(`/api/demandes`)
            .then(res => res.json())
            .then(data => setDemandes(data));
    };

    const changerStatut = (id, nouveauStatut) => {
        apiFetch(`/api/demandes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statut: nouveauStatut })
        })
            .then(() => fetchDemandes());
    };

    const ajouterLigne = () => {
        setFormData(fd => ({
            ...fd,
            lignes: [...fd.lignes, { materielId: '', quantite: 1 }],
        }));
    };

    const supprimerLigne = (i) => {
        setFormData(fd => ({
            ...fd,
            lignes: fd.lignes.filter((_, index) => index !== i),
        }));
    };

    const modifierLigne = (i, field, value) => {
        const lignes = [...formData.lignes];
        lignes[i] = { ...lignes[i], [field]: field === 'quantite' ? Number(value) : value };
        setFormData(fd => ({ ...fd, lignes }));
    };

    const handleFormChange = e => {
        const { name, value } = e.target;
        setFormData(fd => ({ ...fd, [name]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        apiFetch(`/api/demandes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
            .then(res => res.json())
            .then(() => {
                setFormData({ nomProf: '', classe: '', dateUtilisation: '', commentaire: '', lignes: [] });
                fetchDemandes();
                setActiveTab('liste');
            });
    };

    return (
        <div className={styles.container}>
            <h1>Gestion des demandes</h1>

            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab('liste')}
                    className={activeTab === 'liste' ? styles.active : ''}
                >
                    Liste des demandes
                </button>
                <button
                    onClick={() => setActiveTab('nouvelle')}
                    className={activeTab === 'nouvelle' ? styles.active : ''}
                >
                    Nouvelle demande
                </button>
            </div>

            <div className={styles.contenu}>
                {activeTab === 'liste' && (
                    <div className={styles.listeDemandes}>
                        {demandes.map(d => (
                            <div key={d.id} className={styles.demandeCard}>
                                <h4>{d.nomProf} - {d.classe}</h4>
                                <p>Utilisation le : {new Date(d.dateUtilisation).toLocaleDateString()}</p>
                                <p>Statut : <strong>{d.statut}</strong></p>
                                <select value={d.statut} onChange={e => changerStatut(d.id, e.target.value)}>
                                    <option value="en_attente">En attente</option>
                                    <option value="préparée">Préparée</option>
                                    <option value="annulée">Annulée</option>
                                </select>

                                <ul>
                                    {d.lignes.map((l, i) => (
                                        <li key={i}>{l.materiel.nom} — {l.quantite}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'nouvelle' && (
                    <form className={styles.formulaire} onSubmit={handleSubmit}>
                        <label>Nom professeur *</label>
                        <input name="nomProf" value={formData.nomProf} onChange={handleFormChange} required />

                        <label>Classe *</label>
                        <input name="classe" value={formData.classe} onChange={handleFormChange} required />

                        <label>Date *</label>
                        <input type="date" name="dateUtilisation" value={formData.dateUtilisation}
                               onChange={handleFormChange} required />

                        <label>Commentaire</label>
                        <textarea name="commentaire" value={formData.commentaire} onChange={handleFormChange} />

                        <h4>Matériels</h4>
                        {formData.lignes.map((ligne, i) => (
                            <div key={i}>
                                <select value={ligne.materielId}
                                        onChange={e => modifierLigne(i, 'materielId', e.target.value)} required>
                                    <option value="">-- Sélectionner --</option>
                                    {materiels.map(m => (
                                        <option key={m.id} value={m.id}>{m.nom}</option>
                                    ))}
                                </select>
                                <input type="number" min="1" value={ligne.quantite}
                                       onChange={e => modifierLigne(i, 'quantite', e.target.value)} required />
                                <button type="button" onClick={() => supprimerLigne(i)}>Supprimer</button>
                            </div>
                        ))}
                        <button type="button" onClick={ajouterLigne}>Ajouter un matériel</button>
                        <button type="submit">Créer la demande</button>
                    </form>
                )}
            </div>
        </div>
);
}
