const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    line: {
      type: String,
      required: [true, 'La línea es obligatoria'],
      trim: true,
      index: true, // <-- Índice añadido
    },
    code: {
      type: String,
      required: [true, 'El código es obligatorio'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    side: {
      type: String,
      required: [true, 'El lado es obligatorio'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
      index: true, // <-- Índice añadido
    },
    model: {
      type: String,
      required: [true, 'El modelo es obligatorio'],
      trim: true,
      index: true, // <-- Índice añadido
    },
    year: {
      type: Number,
      required: [true, 'El año es obligatorio'],
      min: [1900, 'El año no puede ser anterior a 1900'],
      index: true, // <-- Índice añadido
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'La existencia (stock) es obligatoria'],
      min: [0, 'El stock no puede ser negativo'],
    },
    image: {
      type: String,
      required: [true, 'La imagen es obligatoria'],
      match: [
        /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/,
        'La imagen debe ser una URL válida',
      ],
    },
  },
  { timestamps: true }
);

// Crear índices compuestos si es necesario para mejorar aún más el rendimiento
// Por ejemplo, un índice compuesto para line y brand
ProductoSchema.index({ line: 1, brand: 1 });

module.exports = mongoose.model('Producto', ProductoSchema);