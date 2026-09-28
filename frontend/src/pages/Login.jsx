import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import { login, isLoggedIn } from '../api';
import logo from '../assets/logo.png';
import styles from './styles/Login.module.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    if (isLoggedIn()) {
        navigate('/', { replace: true });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');
        setChargement(true);
        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err) {
            setErreur(err.message);
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className={styles.page}>
            <img src={logo} alt="Logo ArtStock" className={styles.logo} />
            <form className={styles.card} onSubmit={handleSubmit}>
                <h1 className={styles.titre}>Connexion</h1>

                <label className={styles.champ}>
                    <FiMail className={styles.icone} aria-hidden="true" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </label>

                <label className={styles.champ}>
                    <FiLock className={styles.icone} aria-hidden="true" />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>

                {erreur && <p className={styles.erreur}>{erreur}</p>}

                <button type="submit" className={styles.bouton} disabled={chargement}>
                    {chargement ? 'Connexion…' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
}
