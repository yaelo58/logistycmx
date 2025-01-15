const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    line: {
      type: String,
      required: [true, 'La línea (line) es obligatoria'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'El código (code) es obligatorio'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción (description) es obligatoria'],
      trim: true,
    },
    side: {
      type: String,
      required: [true, 'El lado (side) es obligatorio'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'La marca (brand) es obligatoria'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'El modelo (model) es obligatorio'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'El año (year) es obligatorio'],
      min: [1900, 'El año no puede ser menor a 1900'],
    },
    price: {
      type: Number,
      required: [true, 'El precio (price) es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'La existencia (stock) es obligatoria'],
      min: [0, 'La existencia no puede ser negativa'],
    },
    image: {
      type: String,
      required: [true, 'La imagen (image) es obligatoria'],
      match: [
        /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/,
        'La imagen debe ser una URL válida',
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
