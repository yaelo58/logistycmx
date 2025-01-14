// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { body, validationResult, param } = require('express-validator');

// Middleware de validación para crear o actualizar un producto
const validarProducto = [
  body('grupo')
    .trim()
    .notEmpty()
    .withMessage('El grupo es requerido'),
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('El código es requerido'),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('marca')
    .trim()
    .notEmpty()
    .withMessage('La marca es requerida'),
  body('modelo')
    .trim()
    .notEmpty()
    .withMessage('El modelo es requerido'),
  body('precio')
    .isFloat({ gt: 0 })
    .withMessage('El precio debe ser mayor que 0'),
  body('existencia')
    .isInt({ min: 0 })
    .withMessage('La existencia no puede ser negativa'),
  body('imagen')
    .trim()
    .isURL()
    .withMessage('La imagen debe ser una URL válida'),
];

// GET /api/productos - Obtener todos los productos
// NOTA: Se excluye el campo 'grupo' para no mostrarlo en la respuesta JSON
router.get('/', async (req, res) => {
  try {
    // Excluir 'grupo' usando select('-grupo')
    const productos = await Producto.find().select('-grupo');
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
});

// GET /api/productos/:id - Obtener un producto por ID
router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID de producto inválido'),
  async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    try {
      // Excluir 'grupo' al buscar
      const producto = await Producto.findById(req.params.id).select('-grupo');
      if (!producto) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
  }
);

// POST /api/productos - Crear un nuevo producto
router.post('/', validarProducto, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el producto' });
  }
});

module.exports = router;
