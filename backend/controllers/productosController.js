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
      // El año se maneja como un rango en filterProductos
    };

    const [lines, brands, models, startYears, endYears] = await Promise.all([
      Producto.distinct('line', filtro),
      Producto.distinct('brand', filtro),
      Producto.distinct('model', filtro),
      Producto.distinct('startYear', filtro),
      Producto.distinct('endYear', filtro),
    ]);

    res.json({ lines, brands, models, startYears, endYears });
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
      ...(year && { 
        startYear: { $lte: Number(year) }, 
        endYear: { $gte: Number(year) } 
      }),
    };

    const productosFiltrados = await Producto.find(filtro).sort({ createdAt: -1 });
    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
