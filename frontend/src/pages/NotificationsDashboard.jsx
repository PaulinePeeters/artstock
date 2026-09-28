import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import styles from './styles/NotificationsDashboard.module.css';
import { FiBell, FiPackage, FiCalendar, FiAlertTriangle } from 'react-icons/fi';

export default function NotificationsDashboard() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiFetch(`/api/notifications`)
            .then(res => {
                if (!res.ok) throw new Error('Erreur réseau ' + res.status);
                return res.json();
            })
            .then(data => {
                setNotifications(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur fetch notifications :', err);
                setError('Erreur lors du chargement des notifications');
                setLoading(false);
            });
    }, []);

    const getIcon = (type) => {
        switch(type) {
            case 'commande': return <FiPackage size={20} />;
            case 'demande': return <FiBell size={20} />;
            case 'preparation': return <FiCalendar size={20} />;
            case 'alerte': return <FiAlertTriangle size={20} />;
            default: return <FiBell size={20} />;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    };

    if (loading) return <div className={styles.container}>Chargement des notifications...</div>;
    if (error) return <div className={styles.container}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}><FiBell className={styles.titleIcon} aria-hidden="true" /> Notifications de la semaine</h2>
            <ul className={styles.list}>
                {notifications.length === 0 && <li>Aucune notification pour le moment.</li>}
                {notifications.map((notif) => (
                    <li key={notif.id} className={`${styles.notification} ${styles[notif.type] || ''}`}>
                        <div className={styles.icon}>{getIcon(notif.type)}</div>
                        <div className={styles.text}>
                            <span className={styles.date}>{formatDate(notif.date)}</span>
                            <span className={styles.message}>{notif.message}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
