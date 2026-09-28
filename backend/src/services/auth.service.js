import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const TOKEN_DUREE = '12h';

export const AuthService = {
    login: async (email, password) => {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_DUREE }
        );
        return { token, user: { id: user.id, email: user.email, nom: user.nom } };
    },

    changePassword: async (userId, ancienPassword, nouveauPassword) => {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { ok: false, error: 'Utilisateur introuvable' };

        const ok = await bcrypt.compare(ancienPassword, user.passwordHash);
        if (!ok) return { ok: false, error: 'Ancien mot de passe incorrect' };

        if (!nouveauPassword || nouveauPassword.length < 8) {
            return { ok: false, error: 'Le nouveau mot de passe doit faire au moins 8 caractères' };
        }

        const passwordHash = await bcrypt.hash(nouveauPassword, 12);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
        return { ok: true };
    }
};
