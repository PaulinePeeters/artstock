// server.js
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant dans le fichier .env — arrêt du serveur.');
    process.exit(1);
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur backend lancé sur http://0.0.0.0:${PORT}`);
});
