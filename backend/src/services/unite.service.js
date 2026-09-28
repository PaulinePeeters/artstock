import prisma from '../lib/prisma.js';

export const UniteService = {
    getAll: async () => {
        return await prisma.unite.findMany();
    },

    create: async (data) => {
        return await prisma.unite.create({ data });
    },

    update: async (id, data) => {
        return await prisma.unite.update({
            where: { id: Number(id) },
            data
        });
    },

    delete: async (id) => {
        return await prisma.unite.delete({
            where: { id: Number(id) }
        });
    }
};
