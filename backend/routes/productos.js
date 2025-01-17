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
router.get('/', productosController.getAllProductos);

// Ruta para obtener filtros con validaciones
router.get(
  '/filters',
  [
    query('line').optional().isString().trim().withMessage('La línea debe ser una cadena de texto.'),
    query('brand').optional().isString().trim().withMessage('La marca debe ser una cadena de texto.'),
  ],
  validarCampos,
  productosController.getFilters
);

// Ruta para filtrar productos con validaciones
router.get(
  '/filter',
  [
    query('line').optional().isString().trim().withMessage('La línea debe ser una cadena de texto.'),
    query('brand').optional().isString().trim().withMessage('La marca debe ser una cadena de texto.'),
    query('model').optional().isString().trim().withMessage('El modelo debe ser una cadena de texto.'),
    query('year')
      .optional()
      .isInt({ min: 1900 })
      .withMessage('El año debe ser un número entero mayor o igual a 1900.'),
  ],
  validarCampos,
  productosController.filterProductos
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID de producto inválido'),
  validarCampos,
  productosController.getProductoById
);

router.post('/', validarProducto, validarCampos, productosController.createProducto);

module.exports = router;
