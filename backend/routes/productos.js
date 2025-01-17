const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const validarProducto = require('../middlewares/validarProducto');
const { param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const manejarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
  next();
};

// Rutas
router.get('/', productosController.getAllProductos);
router.get('/filters', productosController.getFilters);
router.get('/filter', productosController.filterProductos);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID de producto inválido'),
  manejarErrores,
  productosController.getProductoById
);
router.post('/', validarProducto, manejarErrores, productosController.createProducto);

module.exports = router;
