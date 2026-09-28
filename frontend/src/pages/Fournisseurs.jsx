import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { apiFetch } from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useWindowWidth from './useWindowWidth.js'; // import du hook
import styles from './styles/Fournisseurs.module.css';

export default function Fournisseurs() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingFournisseur, setEditingFournisseur] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        contact: '',
        conditions: '',
        delaiLivraison: ''
    });

    const width = useWindowWidth();

    useEffect(() => {
        fetchFournisseurs();
    }, []);

    async function fetchFournisseurs() {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/fournisseurs`);
            if (!res.ok) throw new Error('Erreur chargement fournisseurs');
            const data = await res.json();
            setFournisseurs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function openModal(fournisseur = null) {
        if (fournisseur) {
            setEditingFournisseur(fournisseur);
            setFormData({
                nom: fournisseur.nom || '',
                adresse: fournisseur.adresse || '',
                telephone: fournisseur.telephone || '',
                email: fournisseur.email || '',
                contact: fournisseur.contact || '',
                conditions: fournisseur.conditions || '',
                delaiLivraison: fournisseur.delaiLivraison || ''
            });
        } else {
            setEditingFournisseur(null);
            setFormData({
                nom: '',
                adresse: '',
                telephone: '',
                email: '',
                contact: '',
                conditions: '',
                delaiLivraison: ''
            });
        }
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setError(null);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        try {
            const method = editingFournisseur ? 'PUT' : 'POST';
            const url = editingFournisseur
                ? `/api/fournisseurs/${editingFournisseur.id}`
                : `/api/fournisseurs`;

            const res = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    delaiLivraison: formData.delaiLivraison ? parseInt(formData.delaiLivraison, 10) : null
                }),
            });

            if (!res.ok) throw new Error('Erreur lors de la sauvegarde');

            await fetchFournisseurs();
            closeModal();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Confirmer la suppression ?')) return;
        try {
            const res = await apiFetch(`/api/fournisseurs/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Erreur suppression');
            await fetchFournisseurs();
        } catch {
            alert('Erreur lors de la suppression');
        }
    }

    // --- Export PDF historique commandes du fournisseur ---
    async function exportHistoriquePDF(fournisseurId, fournisseurNom) {
        try {
            const res = await apiFetch(`/api/commandes/fournisseur/${fournisseurId}`);
            if (!res.ok) throw new Error('Erreur récupération commandes');
            const commandes = await res.json();

            const doc = new jsPDF();

            doc.setFontSize(16);
            doc.text(`Historique des commandes - ${fournisseurNom}`, 14, 15);
            doc.setFontSize(12);
            doc.text(`Date d'export : ${new Date().toLocaleDateString()}`, 14, 25);

            const columns = ['ID commande', 'Date commande', 'Date réception', 'Statut', 'Nb lignes'];

            const rows = commandes.map(cmd => [
                cmd.id,
                new Date(cmd.dateCommande).toLocaleDateString(),
                cmd.dateReception ? new Date(cmd.dateReception).toLocaleDateString() : '-',
                cmd.statut,
                cmd.lignesCommande.length
            ]);

            autoTable(doc, {
                startY: 35,
                head: [columns],
                body: rows,
                theme: 'striped',
            });

            doc.save(`Historique_Commandes_${fournisseurNom}_${new Date().toISOString().slice(0,10)}.pdf`);
        } catch (err) {
            alert('Erreur lors de l\'export PDF : ' + err.message);
        }
    }

    return (
        <div className={styles.container}>
            <h1>Gestion des Fournisseurs</h1>

            <button className={styles.btnAdd} onClick={() => openModal()}>
                + Ajouter un fournisseur
            </button>

            {loading && <p>Chargement...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && fournisseurs.length === 0 && <p>Aucun fournisseur trouvé.</p>}

            {/* Affichage tableau uniquement si écran large */}
            {!loading && fournisseurs.length > 0 && width > 768 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Téléphone</th>
                            <th>Email</th>
                            <th>Contact</th>
                            <th>Conditions</th>
                            <th>Délai livraison (jours)</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {fournisseurs.map(f => (
                            <tr key={f.id}>
                                <td>{f.nom}</td>
                                <td>{f.adresse || '-'}</td>
                                <td>{f.telephone || '-'}</td>
                                <td>{f.email || '-'}</td>
                                <td>{f.contact || '-'}</td>
                                <td>{f.conditions || '-'}</td>
                                <td>{f.delaiLivraison ?? '-'}</td>
                                <td className={styles.actions}>
                                    <button onClick={() => openModal(f)} title="Modifier"><FiEdit2 /></button>
                                    <button onClick={() => handleDelete(f.id)} title="Supprimer"><FiTrash2 /></button>
                                    <button
                                        className={styles.btnExport}
                                        onClick={() => exportHistoriquePDF(f.id, f.nom)}
                                        title="Exporter historique commandes PDF"
                                    >
                                        Export Historique
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Affichage cartes sur tablette et mobile */}
            {!loading && fournisseurs.length > 0 && width <= 820 && (
                <div className={`${styles.cardTable}`}>
                    {fournisseurs.map(f => (
                        <div key={f.id} className={styles.cardRow}>
                            <div className={styles.cardItem}><strong>Nom :</strong> {f.nom}</div>
                            <div className={styles.cardItem}><strong>Adresse :</strong> {f.adresse || '-'}</div>
                            <div className={styles.cardItem}><strong>Téléphone :</strong> {f.telephone || '-'}</div>
                            <div className={styles.cardItem}><strong>Email :</strong> {f.email || '-'}</div>
                            <div className={styles.cardItem}><strong>Contact :</strong> {f.contact || '-'}</div>
                            <div className={styles.cardItem}><strong>Conditions :</strong> {f.conditions || '-'}</div>
                            <div className={styles.cardItem}><strong>Délai livraison :</strong> {f.delaiLivraison ?? '-'}</div>
                            <div className={styles.actions}>
                                <button onClick={() => openModal(f)} title="Modifier"><FiEdit2 /></button>
                                <button onClick={() => handleDelete(f.id)} title="Supprimer"><FiTrash2 /></button>
                                <button
                                    className={styles.btnExport}
                                    onClick={() => exportHistoriquePDF(f.id, f.nom)}
                                    title="Exporter historique commandes PDF"
                                >
                                    Export Historique
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>{editingFournisseur ? 'Modifier fournisseur' : 'Ajouter un fournisseur'}</h3>
                        {error && <p className={styles.error}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Nom*<br />
                                    <input
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Adresse<br />
                                    <input
                                        name="adresse"
                                        value={formData.adresse}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Téléphone<br />
                                    <input
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email<br />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Contact<br />
                                    <input
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Conditions<br />
                                    <textarea
                                        name="conditions"
                                        value={formData.conditions}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Délai livraison (jours)<br />
                                    <input
                                        name="delaiLivraison"
                                        type="number"
                                        min={0}
                                        value={formData.delaiLivraison}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>

                            <button type="submit" className={styles.btnPrimary}>
                                {editingFournisseur ? 'Modifier' : 'Ajouter'}
                            </button>
                            <button type="button" className={styles.btnSecondary} onClick={closeModal}>Annuler</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
