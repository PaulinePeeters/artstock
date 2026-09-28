import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import materielRoutes from './routes/materiel.route.js';
import uniteRoutes from './routes/unite.route.js';
import demandeRoutes from './routes/demande.route.js';
import commandeRoutes from './routes/commande.route.js';
import notificationRoutes from './routes/notification.route.js';
import fournisseurRoutes from './routes/fournisseur.route.js';
import { requireAuth } from './middleware/auth.middleware.js';

const app = express();
app.use(express.json());
app.use(cors());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/materiels', requireAuth, materielRoutes);
app.use('/api/unites', requireAuth, uniteRoutes);
app.use('/api/demandes', requireAuth, demandeRoutes);
app.use('/api/commandes', requireAuth, commandeRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/fournisseurs', requireAuth, fournisseurRoutes);

export default app;
