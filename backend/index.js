const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// 1. Configuración de Middlewares (Seguridad y Datos)
app.use(cors());
app.use(helmet());
app.use(express.json());

// 2. ESCUDO ANTI-SPAM (Rate Limit)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 registros por IP
    message: {
        error: "Has enviado demasiadas propuestas. Por favor, espera 15 minutos antes de registrar más."
    }
});

// 3. ESQUEMA DE VALIDACIÓN (Zod)
// Asegura que el texto no esté vacío y no pase de 100 caracteres.
const RegistroSchema = z.object({
    contenido: z.string().min(1, "El campo no puede estar vacío").max(100, "Texto demasiado largo")
});

// --- RUTAS DEL CRUD ---

// A. Crear Registro (POST) - ¡Con Rate Limit y Zod activados!
app.post('/registros', limiter, async (req, res) => {
    try {
        // 1. Zod revisa que el texto sea válido (Pasa por la aduana)
        const validatedData = RegistroSchema.parse(req.body);
        console.log("Dato validado y limpio:", validatedData.contenido);

        // 2. Prisma lo guarda de forma segura en MySQL
        const nuevo = await prisma.registro.create({
            data: { contenido: validatedData.contenido }
        });

        console.log("Guardado en BD:", nuevo);
        res.status(201).json(nuevo);
    } catch (error) {
        // Si Zod detecta un error (ej. texto vacío), el código salta directo para acá
        console.log("Error de validación:", error);
        // Enviamos el mensaje de Zod al frontend para que sepa qué falló
        res.status(400).json({ error: error.errors || "Datos inválidos" });
    }
});

// B. Leer todos los registros (GET)
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

// C. Eliminar Registro (DELETE)
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

// D. Editar Registro (PUT)
app.put('/registros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Zod también protege la edición para que no cambien un registro por texto vacío
        const validatedData = RegistroSchema.parse(req.body);
        const actualizado = await prisma.registro.update({
            where: { id: parseInt(id) },
            data: { contenido: validatedData.contenido }
        });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ error: error.errors || "Error al actualizar" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor seguro en puerto ${PORT}`));