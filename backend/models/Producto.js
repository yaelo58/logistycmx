// models/Producto.js

const mongoose = require('mongoose');
const validator = require('validator');

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    imagen: {
        type: String,
        required: [true, 'La imagen es obligatoria'],
        validate: {
            validator: (v) => validator.isURL(v),
            message: 'La imagen debe ser una URL válida'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);
