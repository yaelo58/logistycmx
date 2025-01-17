const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    line: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, required: true, trim: true, index: true },
    side: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },
    startYear: { type: Number, required: true, min: 1900, index: true },
    endYear: { type: Number, required: true, min: 1900, index: true },
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

// Índices compuestos para optimizar consultas
ProductoSchema.index({ line: 1, brand: 1 });
ProductoSchema.index({ brand: 1, model: 1 });
ProductoSchema.index({ brand: 1, model: 1, startYear: 1, endYear: 1 });
ProductoSchema.index({ model: 1 });
ProductoSchema.index({ startYear: 1, endYear: 1 });

// Índice de texto para búsquedas eficientes
ProductoSchema.index({ description: 'text', code: 'text' });

module.exports = mongoose.model('Producto', ProductoSchema);
