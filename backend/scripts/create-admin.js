// Crée (ou met à jour) le compte admin.
// Usage : node scripts/create-admin.js <email> <mot_de_passe>
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const [email, password] = process.argv.slice(2);

if (!email || !password) {
    console.error('Usage : node scripts/create-admin.js <email> <mot_de_passe>');
    process.exit(1);
}
if (password.length < 8) {
    console.error('Le mot de passe doit faire au moins 8 caractères.');
    process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { passwordHash },
    create: { email: email.toLowerCase().trim(), passwordHash, nom: 'Admin' }
});

console.log(`Compte admin prêt : ${user.email} (id ${user.id})`);
await prisma.$disconnect();
