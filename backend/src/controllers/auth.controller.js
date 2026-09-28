import { AuthService } from '../services/auth.service.js';

export const AuthController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email et mot de passe requis' });
            }
            const result = await AuthService.login(email, password);
            if (!result) {
                return res.status(401).json({ error: 'Identifiants invalides' });
            }
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: 'Erreur lors de la connexion' });
        }
    },

    me: async (req, res) => {
        res.json({ userId: req.user.userId, email: req.user.email });
    },

    changePassword: async (req, res) => {
        try {
            const { ancienPassword, nouveauPassword } = req.body;
            const result = await AuthService.changePassword(req.user.userId, ancienPassword, nouveauPassword);
            if (!result.ok) return res.status(400).json({ error: result.error });
            res.json({ message: 'Mot de passe modifié' });
        } catch (err) {
            res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
        }
    }
};
