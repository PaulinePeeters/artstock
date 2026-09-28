import React, { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { apiFetch } from '../api';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './styles/Preparation.module.css';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { locale: fr }),
    getDay,
    locales: { fr },
});

export default function Preparation() {
    const [evenements, setEvenements] = useState([]);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [showDropdown, setShowDropdown] = useState(false);
    const [modalEvents, setModalEvents] = useState(null); // Pour afficher liste événements +X more
    const [modalDate, setModalDate] = useState(null);

    useEffect(() => {
        apiFetch(`/api/demandes/preparees`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Erreur réseau ' + res.status);
                }
                return res.json();
            })
            .then(data => {
                const events = data.map(demande => {
                    const startDate = new Date(demande.dateUtilisation);
                    startDate.setDate(startDate.getDate() - 1); // 1 jour avant
                    return {
                        id: demande.id,
                        title: `${demande.nomProf} - ${demande.classe} (${demande.statut})`,
                        start: startDate,
                        end: startDate,
                        demande,
                    };
                });
                setEvenements(events);
            })
            .catch(err => {
                console.error('Erreur fetch demandes préparées :', err);
            });
    }, []);

    const goToToday = () => setDate(new Date());
    const goToPrevious = () => {
        const newDate = new Date(date);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
        else newDate.setDate(newDate.getDate() - 1);
        setDate(newDate);
    };
    const goToNext = () => {
        const newDate = new Date(date);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
        else newDate.setDate(newDate.getDate() + 1);
        setDate(newDate);
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);
    const handleSelectView = (newView) => {
        setView(newView);
        setShowDropdown(false);
    };

    // Gestion du clic sur +X more : on ouvre une modal simple (ou alert)
    const handleShowMore = (events, date) => {
        setModalEvents(events);
        setModalDate(date);
    };

    // Fermer la modal
    const closeModal = () => {
        setModalEvents(null);
        setModalDate(null);
    };

    const formatDateTitle = (date, view) => {
        if (view === 'month') return format(date, 'MMMM yyyy', { locale: fr });
        if (view === 'week') return `Semaine du ${format(startOfWeek(date, { locale: fr }), 'dd MMMM yyyy', { locale: fr })}`;
        if (view === 'day') return format(date, 'dd MMMM yyyy', { locale: fr });
        return '';
    };

    return (
        <div className={styles.container}>
            <h1>Calendrier de préparation</h1>

            <div className={styles.toolbar}>
                <button onClick={goToToday} className={styles.toolbarBtn}>Aujourd'hui</button>
                <button onClick={goToPrevious} className={styles.toolbarBtn}>Précédent</button>

                <div className={styles.dateTitle}>{formatDateTitle(date, view)}</div>

                <button onClick={goToNext} className={styles.toolbarBtn}>Suivant</button>

                <div className={styles.viewToggle}>
                    <button onClick={toggleDropdown} className={styles.toggleBtn}>
                        Vue : {view.charAt(0).toUpperCase() + view.slice(1)} <FiChevronDown />
                    </button>
                    {showDropdown && (
                        <ul className={styles.dropdownMenu}>
                            {['month', 'week', 'day'].map(v => (
                                <li key={v}>
                                    <button
                                        className={v === view ? styles.activeView : ''}
                                        onClick={() => handleSelectView(v)}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className={styles.calendarWrapper}>
                <Calendar
                    localizer={localizer}
                    events={evenements}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    view={view}
                    date={date}
                    onNavigate={setDate}
                    onView={() => {}}
                    toolbar={false}
                    messages={{
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour',
                        today: "Aujourd'hui",
                        previous: 'Précédent',
                        next: 'Suivant',
                    }}
                    onShowMore={handleShowMore}
                />
            </div>

            {/* Modal simple pour afficher événements du jour */}
            {modalEvents && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>Demandes du {format(modalDate, 'dd MMMM yyyy', { locale: fr })}</h3>
                        <ul>
                            {modalEvents.map(evt => (
                                <li key={evt.id}>
                                    {evt.title}
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeModal}>Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
}
