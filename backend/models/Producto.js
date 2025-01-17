const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    line: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    side: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    year: { type: Number, required: true, min: 1900, index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    image: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/, 'La imagen debe ser una URL válida'],
    },
  },
  { timestamps: true }
);

// Índice compuesto para mejorar rendimiento en consultas frecuentes
ProductoSchema.index({ line: 1, brand: 1 });

module.exports = mongoose.model('Producto', ProductoSchema);
