const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    // Ahora se llama 'line' (antes era 'grupo')
    line: {
      type: String,
      required: [true, 'La línea es obligatoria'],
      trim: true,
    },
    // Ahora se llama 'code' (antes era 'codigo')
    code: {
      type: String,
      required: [true, 'El código es obligatorio'],
      trim: true,
      unique: true,
    },
    // Ahora se llama 'description' (antes era 'descripcion')
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    // Ahora se llama 'side' (antes era 'lado')
    side: {
      type: String,
      required: [true, 'El lado es obligatorio'],
      trim: true,
    },
    // Ahora se llama 'brand' (antes era 'marca')
    brand: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
    },
    // Ahora se llama 'model' (antes era 'modelo')
    model: {
      type: String,
      required: [true, 'El modelo es obligatorio'],
      trim: true,
    },
    // Campo nuevo 'year' (antes se utilizaba de manera implícita o no existía)
    year: {
      type: Number,
      required: [true, 'El año es obligatorio'],
      min: [1900, 'El año no puede ser anterior a 1900'],
    },
    // Ahora se llama 'price' (antes era 'precio')
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    // Ahora se llama 'stock' (antes era 'existencia')
    stock: {
      type: Number,
      required: [true, 'La existencia (stock) es obligatoria'],
      min: [0, 'El stock no puede ser negativo'],
    },
    // Ahora se llama 'image' (antes era 'imagen')
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

module.exports = mongoose.model('Producto', ProductoSchema);
