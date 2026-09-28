import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiFetch } from '../api';
import styles from './styles/FormulaireMateriel.module.css';

export default function FormulaireMateriel({ materiel, mode, onDone, unites: initialUnites }) {
    const [formData, setFormData] = useState({
        nom: '',
        type: '',
        uniteId: '',
        quantiteUnites: 0,
        quantiteParUnite: '',
        seuilAlerte: 0,
    });

    const [unites, setUnites] = useState(initialUnites || []);
    const [selectedUnite, setSelectedUnite] = useState(null);
    const [showNewUniteForm, setShowNewUniteForm] = useState(false);
    const [newUnite, setNewUnite] = useState('');
    const [multipliable, setMultipliable] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fournisseurs liés au matériel, avec le code de l'article chez chacun
    const [fournisseurs, setFournisseurs] = useState([]);
    const [fournisseursLies, setFournisseursLies] = useState([]);

    useEffect(() => {
        apiFetch(`/api/fournisseurs`)
            .then(res => res.json())
            .then(data => setFournisseurs(Array.isArray(data) ? data : []))
            .catch(() => setFournisseurs([]));
    }, []);

    useEffect(() => {
        setUnites(initialUnites || []);
    }, [initialUnites]);

    useEffect(() => {
        if (formData.uniteId) {
            const found = unites.find(u => u.id === parseInt(formData.uniteId));
            setSelectedUnite(found || null);
        } else {
            setSelectedUnite(null);
        }
    }, [formData.uniteId, unites]);

    useEffect(() => {
        if (mode === 'modif' && materiel) {
            setFormData({
                nom: materiel.nom || '',
                type: materiel.type || '',
                uniteId: materiel.uniteId?.toString() || '',
                quantiteUnites: materiel.quantiteUnites || 0,
                quantiteParUnite: materiel.quantiteParUnite || '',
                seuilAlerte: materiel.seuilAlerte || 0,
            });
            setFournisseursLies(
                (materiel.fournisseurs || []).map(f => ({
                    fournisseurId: f.fournisseurId.toString(),
                    codeArticle: f.codeArticle || ''
                }))
            );
        }
    }, [materiel, mode]);

    const ajouterFournisseurLie = () => {
        setFournisseursLies(fs => [...fs, { fournisseurId: '', codeArticle: '' }]);
    };

    const modifierFournisseurLie = (index, champ, valeur) => {
        setFournisseursLies(fs => fs.map((f, i) => (i === index ? { ...f, [champ]: valeur } : f)));
    };

    const supprimerFournisseurLie = (index) => {
        setFournisseursLies(fs => fs.filter((_, i) => i !== index));
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(fd => ({
            ...fd,
            [name]: name.includes('quantite') || name.includes('seuil') ? Number(value) : value
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            quantiteParUnite: selectedUnite?.multipliable ? Number(formData.quantiteParUnite) : null,
            uniteId: Number(formData.uniteId),
            fournisseurs: fournisseursLies
                .filter(f => f.fournisseurId)
                .map(f => ({
                    fournisseurId: Number(f.fournisseurId),
                    codeArticle: f.codeArticle.trim() || null
                })),
        };

        const url = mode === 'ajout' ? `/api/materiels` : `/api/materiels/${materiel.id}`;
        const method = mode === 'ajout' ? 'POST' : 'PUT';

        apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(() => {
                setLoading(false);
                onDone();
            })
            .catch(() => {
                alert('Erreur lors de la sauvegarde');
                setLoading(false);
            });
    };

    const handleAddUnite = () => {
        if (!newUnite.trim()) return;

        apiFetch(`/api/unites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: newUnite, multipliable }),
        })
            .then(res => res.json())
            .then(data => {
                const updated = [...unites, data];
                setUnites(updated);
                setFormData(fd => ({ ...fd, uniteId: data.id.toString() }));
                setNewUnite('');
                setShowNewUniteForm(false);
                setMultipliable(false);
            })
            .catch(() => alert("Erreur lors de l'ajout de l'unité"));
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div>
                <label>Nom</label>
                <input name="nom" value={formData.nom} onChange={handleChange} required />
            </div>

            <div>
                <label>Type</label>
                <input name="type" value={formData.type} onChange={handleChange} />
            </div>

            <div className={styles.uniteWrapper}>
                <label>Unité</label>
                <div className={styles.uniteSelect}>
                    <select name="uniteId" value={formData.uniteId} onChange={handleChange} required>
                        <option value="">-- Choisir une unité --</option>
                        {unites.map(unite => (
                            <option key={unite.id} value={unite.id}>
                                {unite.nom}
                            </option>
                        ))}
                    </select>
                    <button type="button" className={styles.addBtn} onClick={() => setShowNewUniteForm(!showNewUniteForm)}><FiPlus /></button>
                </div>

                {showNewUniteForm && (
                    <div className={styles.card}>
                        <input
                            type="text"
                            value={newUnite}
                            onChange={e => setNewUnite(e.target.value)}
                            placeholder="Nouvelle unité"
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={multipliable}
                                onChange={e => setMultipliable(e.target.checked)}
                            />
                            Multipliable
                        </label>
                        <button type="button" onClick={handleAddUnite}>Ajouter</button>
                    </div>
                )}
            </div>

            <div>
                <label>Quantité ({selectedUnite?.nom || "unité"})</label>
                <input name="quantiteUnites" type="number" min="0" value={formData.quantiteUnites} onChange={handleChange} required />
            </div>

            {selectedUnite?.multipliable && (
                <div>
                    <label>Quantité par {selectedUnite.nom}</label>
                    <input name="quantiteParUnite" type="number" min="1" value={formData.quantiteParUnite} onChange={handleChange} required />
                </div>
            )}

            <div>
                <label>Seuil d'alerte</label>
                <input name="seuilAlerte" type="number" min="0" value={formData.seuilAlerte} onChange={handleChange} required />
            </div>

            <div className={styles.fournisseursSection}>
                <label>Fournisseurs</label>
                {fournisseursLies.map((f, i) => (
                    <div key={i} className={styles.fournisseurLigne}>
                        <select
                            value={f.fournisseurId}
                            onChange={e => modifierFournisseurLie(i, 'fournisseurId', e.target.value)}
                            required
                        >
                            <option value="">-- Choisir un fournisseur --</option>
                            {fournisseurs
                                .filter(fo =>
                                    fo.id.toString() === f.fournisseurId ||
                                    !fournisseursLies.some(fl => fl.fournisseurId === fo.id.toString())
                                )
                                .map(fo => (
                                    <option key={fo.id} value={fo.id}>{fo.nom}</option>
                                ))}
                        </select>
                        <input
                            type="text"
                            value={f.codeArticle}
                            onChange={e => modifierFournisseurLie(i, 'codeArticle', e.target.value)}
                            placeholder="Code article chez ce fournisseur"
                        />
                        <button
                            type="button"
                            title="Retirer ce fournisseur"
                            onClick={() => supprimerFournisseurLie(i)}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
                <button type="button" className={styles.addBtn} onClick={ajouterFournisseurLie}>
                    <FiPlus /> Ajouter un fournisseur
                </button>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
        </form>
    );
}
