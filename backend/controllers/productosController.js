// backend/controllers/productosController.js
const Producto = require('../models/Producto');

// Obtener todos los productos con paginación opcional
exports.getAllProductos = async (req, res, next) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res, next) => {
  try {
    const producto = new Producto(req.body);
    const productoGuardado = await producto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    // Manejar errores de duplicados
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'El código del producto ya existe.' });
    }
    next(error);
  }
};

// Obtener filtros dinámicos
exports.getFilters = async (req, res, next) => {
  try {
    const { line, brand, model, year } = req.query;
    const filtro = {
      ...(line && { line }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && { year: Number(year) }),
    };

    const [lines, brands, models, years] = await Promise.all([
      Producto.distinct('line', filtro),
      Producto.distinct('brand', filtro),
      Producto.distinct('model', filtro),
      Producto.distinct('year', filtro),
    ]);

    res.json({ lines, brands, models, years });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos
exports.filterProductos = async (req, res, next) => {
  try {
    const { line, brand, model, year } = req.query;
    const filtro = {
      ...(line && { line }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && { year: Number(year) }),
    };

    const productosFiltrados = await Producto.find(filtro).sort({ createdAt: -1 });
    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
