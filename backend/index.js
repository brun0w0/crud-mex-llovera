const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Configuración de Middlewares (Seguridad y Datos)
app.use(cors());
app.use(helmet()); // Solo una declaración y un uso
app.use(express.json());

// --- ESQUEMA DE VALIDACIÓN (Tu escudo contra inyecciones) ---
const RegistroSchema = z.object({
    contenido: z.string().min(1, "El campo no puede estar vacío").max(100, "Texto demasiado largo")
});

// --- RUTAS DEL CRUD ---

// 1. Crear Registro (POST)
app.post('/registros', async (req, res) => {
    try {
        const validatedData = RegistroSchema.parse(req.body);
        const nuevo = await prisma.registro.create({
            data: { contenido: validatedData.contenido }
        });
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ error: "Datos no válidos o intento de inyección bloqueado" });
    }
});

// 2. Leer todos los registros (GET)
app.get('/registros', async (req, res) => {
    try {
        const registros = await prisma.registro.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener registros" });
    }
});

// 3. Eliminar Registro (DELETE)
app.delete('/registros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.registro.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Eliminado correctamente" });
    } catch (error) {
        res.status(400).json({ error: "No se pudo eliminar" });
    }
});

// 4. Editar Registro (PUT)
app.put('/registros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const validatedData = RegistroSchema.parse(req.body);
        const actualizado = await prisma.registro.update({
            where: { id: parseInt(id) },
            data: { contenido: validatedData.contenido }
        });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor seguro en puerto ${PORT}`));