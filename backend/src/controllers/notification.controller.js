import * as notificationService from '../services/notification.service.js';

export async function getNotifications(req, res) {
    try {
        const notifications = await notificationService.getNotifications();
        res.json(notifications);
    } catch (error) {
        console.error('Erreur récupération notifications :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
