const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema(
  {
    // Campo que se usará internamente para segmentar y NO se mostrará en el frontend
    grupo: {
      type: String,
      required: [true, 'El grupo es obligatorio'],
      trim: true,
    },
    codigo: {
      type: String,
      required: [true, 'El código es obligatorio'],
      trim: true,
      unique: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    marca: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
    },
    modelo: {
      type: String,
      required: [true, 'El modelo es obligatorio'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    existencia: {
      type: Number,
      required: [true, 'La existencia es obligatoria'],
      min: [0, 'La existencia no puede ser negativa'],
    },
    imagen: {
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
