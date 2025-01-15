const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { body, validationResult, param } = require('express-validator');

// Middleware de validación para crear o actualizar un producto
const validateProduct = [
  body('line')
    .trim()
    .notEmpty()
    .withMessage('La línea (line) es requerida'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('El código (code) es requerido'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción (description) es requerida'),
  body('side')
    .trim()
    .notEmpty()
    .withMessage('El lado (side) es requerido'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('La marca (brand) es requerida'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('El modelo (model) es requerido'),
  body('year')
    .isInt({ min: 1900 })
    .withMessage('El año (year) debe ser un número válido (>=1900)'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('El precio (price) debe ser mayor que 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('La existencia (stock) no puede ser negativa'),
  body('image')
    .trim()
    .isURL()
    .withMessage('La imagen (image) debe ser una URL válida'),
];

// GET /api/products - Obtener todos los productos
// Excluir line, side, brand, model, year
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().select('-line -side -brand -model -year');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
});

// GET /api/products/:id - Obtener un producto por ID (excluir también)
router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID de producto inválido'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id).select('-line -side -brand -model -year');
      if (!product) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
  }
);

// POST /api/products - Crear un nuevo producto
router.post('/', validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el producto' });
  }
});

module.exports = router;