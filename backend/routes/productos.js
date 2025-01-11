// routes/productos.js

const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { body, validationResult } = require('express-validator');

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
});

// POST /api/productos - Crear un nuevo producto
router.post('/',
    [
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('descripcion').notEmpty().withMessage('La descripción es requerida'),
        body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor que 0'),
        body('imagen').isURL().withMessage('La imagen debe ser una URL válida')
    ],
    async (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const { nombre, descripcion, precio, imagen } = req.body;

        try {
            const nuevoProducto = new Producto({ nombre, descripcion, precio, imagen });
            await nuevoProducto.save();
            res.status(201).json(nuevoProducto);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al crear el producto' });
        }
    }
);

// Otros endpoints (PUT, DELETE) pueden añadirse aquí siguiendo la misma estructura

module.exports = router;
