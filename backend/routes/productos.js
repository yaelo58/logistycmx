const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { body, validationResult, param, query } = require('express-validator');

// Middleware de validación para crear o actualizar un producto
const validarProducto = [
  body('line')
    .trim()
    .notEmpty()
    .withMessage('La línea es requerida'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('El código es requerido'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('side')
    .trim()
    .notEmpty()
    .withMessage('El lado es requerido'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('La marca es requerida'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('El modelo es requerido'),
  body('year')
    .isInt({ min: 1900 })
    .withMessage('El año debe ser mayor o igual a 1900'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('El precio debe ser mayor que 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock (existencia) no puede ser negativo'),
  body('image')
    .trim()
    .isURL()
    .withMessage('La imagen debe ser una URL válida'),
];

// ---------------------
// NUEVAS RUTAS DE FILTROS
// ---------------------

/**
 * GET /api/productos/filters
 * Obtiene los valores distintos de line, brand, model, year
 * de manera dinámica según los query params que se envíen.
 * Ejemplo de uso:
 *   /api/productos/filters?line=FRENOS&brand=TOYOTA
 *   Esto devolverá las 'model' y 'year' que correspondan a esa line y brand
 */
router.get('/filters', async (req, res) => {
  try {
    const { line, brand, model, year } = req.query;

    // Construir objeto de búsqueda
    const filtro = {};
    if (line) filtro.line = line;
    if (brand) filtro.brand = brand;
    if (model) filtro.model = model;
    if (year) filtro.year = Number(year);

    // Hacemos distinct de cada campo pero aplicando el filtro
    const [lines, brands, models, years] = await Promise.all([
      Producto.distinct('line', filtro),
      Producto.distinct('brand', filtro),
      Producto.distinct('model', filtro),
      Producto.distinct('year', filtro),
    ]);

    res.json({ lines, brands, models, years });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener filtros' });
  }
});

/**
 * GET /api/productos/filter
 * Obtiene los productos filtrados según los parámetros que se envíen:
 *   ?line=...&brand=...&model=...&year=...
 */
router.get('/filter', async (req, res) => {
  try {
    const { line, brand, model, year } = req.query;
    const filtro = {};
    if (line) filtro.line = line;
    if (brand) filtro.brand = brand;
    if (model) filtro.model = model;
    if (year) filtro.year = Number(year);

    const productosFiltrados = await Producto.find(filtro);
    res.json(productosFiltrados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al filtrar productos' });
  }
});

// ---------------------
// Rutas existentes
// ---------------------

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
      const producto = await Producto.findById(req.params.id);
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