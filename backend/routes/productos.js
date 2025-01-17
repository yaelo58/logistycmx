// backend/routes/productos.js

const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const validarProducto = require('../middlewares/validarProducto');
const manejarErrores = require('../middlewares/manejarErrores');
const { param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

// Rutas
router.get(
  '/',
  [
    // Validar posibles query params para filtros
    query('line').optional().isString().trim(),
    query('brand').optional().isString().trim(),
    query('model').optional().isString().trim(),
    query('year').optional().isInt({ min: 1900 }),
    validarCampos
  ],
  productosController.getAllProductos
);

router.get(
  '/filters',
  [
    // Validar posibles query params para filtros
    query('line').optional().isString().trim(),
    query('brand').optional().isString().trim(),
    query('model').optional().isString().trim(),
    validarCampos
  ],
  productosController.getFilters
);

router.get(
  '/filter',
  [
    // Validar posibles query params para filtros
    query('line').optional().isString().trim(),
    query('brand').optional().isString().trim(),
    query('model').optional().isString().trim(),
    query('year').optional().isInt({ min: 1900 }),
    validarCampos
  ],
  productosController.filterProductos
);

router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de producto inválido'),
    validarCampos
  ],
  productosController.getProductoById
);

router.post(
  '/',
  validarProducto,
  validarCampos,
  productosController.createProducto
);

module.exports = router;
