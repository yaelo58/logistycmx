// backend/middlewares/validarProducto.js
const { body } = require('express-validator');

const validarProducto = [
  body('line').trim().notEmpty().withMessage('La línea es requerida'),
  body('code').trim().notEmpty().withMessage('El código es requerido'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida'),
  body('side').trim().notEmpty().withMessage('El lado es requerido'),
  body('brand').trim().notEmpty().withMessage('La marca es requerida'),
  body('model').trim().notEmpty().withMessage('El modelo es requerido'),
  body('startYear')
    .isInt({ min: 1900 })
    .withMessage('El año de inicio debe ser un número entero mayor o igual a 1900'),
  body('endYear')
    .isInt({ min: 1900 })
    .withMessage('El año de fin debe ser un número entero mayor o igual a 1900'),
  body('endYear').custom((value, { req }) => {
    if (value < req.body.startYear) {
      throw new Error('El año de fin debe ser mayor o igual al año de inicio');
    }
    return true;
  }),
  body('price').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor que 0'),
  body('stock').isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  body('image').trim().isURL().withMessage('La imagen debe ser una URL válida'),
];

module.exports = validarProducto;
