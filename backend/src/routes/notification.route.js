import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', notificationController.getNotifications);

export default router;
