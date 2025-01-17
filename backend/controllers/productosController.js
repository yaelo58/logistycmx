// backend/controllers/productosController.js

const Producto = require('../models/Producto');

// Obtener todos los productos con paginación opcional
exports.getAllProductos = async (req, res, next) => {
  try {
    const productos = await Producto.find()
      .sort({ createdAt: -1 })
      .lean(); // Uso de .lean() para mejorar el rendimiento
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id).lean(); // Uso de .lean()
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

// Obtener filtros dinámicos con lógica de filtros dependientes
exports.getFilters = async (req, res, next) => {
  try {
    const { line, brand } = req.query;

    const filtroBase = {
      ...(line && { line }),
      ...(brand && { brand }),
    };

    // Obtener líneas, marcas, modelos y años distintos basados en los filtros actuales
    const [lines, brands, models, yearStats] = await Promise.all([
      Producto.distinct('line', filtroBase).lean(),
      Producto.distinct('brand', filtroBase).lean(),
      Producto.distinct('model', { ...filtroBase, ...(brand ? { brand } : {}) }).lean(),
      Producto.aggregate([
        { $match: filtroBase },
        {
          $group: {
            _id: null,
            minStartYear: { $min: "$startYear" },
            maxEndYear: { $max: "$endYear" },
          },
        },
      ]),
    ]);

    // Extraer el año mínimo y máximo
    const minYear = yearStats[0]?.minStartYear || null;
    const maxYear = yearStats[0]?.maxEndYear || null;

    res.json({ lines, brands, models, minYear, maxYear });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos con búsqueda
exports.filterProductos = async (req, res, next) => {
  try {
    const { line, brand, model, year, search } = req.query;
    let filtro = {
      ...(line && { line }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && { 
        startYear: { $lte: Number(year) }, 
        endYear: { $gte: Number(year) } 
      }),
    };

    // Si hay un término de búsqueda, usar $text para una búsqueda eficiente
    if (search) {
      filtro.$text = { $search: search };
    }

    const productosFiltrados = await Producto.find(filtro, search ? { score: { $meta: "textScore" } } : {})
      .sort(search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
      .lean(); // Uso de .lean()

    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
