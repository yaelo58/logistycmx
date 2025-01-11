// routes/productos.js

const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
});

// Opcional: otros endpoints como crear, actualizar, eliminar productos

module.exports = router;
