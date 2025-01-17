// backend/controllers/productosController.js

const Producto = require('../models/Producto');

// Obtener todos los productos con paginación opcional
exports.getAllProductos = async (req, res, next) => {
  try {
    const productos = await Producto.find()
      .sort({ createdAt: -1 })
      .lean(); // Usar lean para mejorar el rendimiento
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id)
      .lean(); // Usar lean
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
    const { line, brand } = req.query; // Solo line y brand para obtener opciones dependientes

    const filtroBase = {
      ...(line && { line }),
      ...(brand && { brand }),
    };

    // Optimizar consultas utilizando agregaciones paralelas
    const [lines, brands, models, yearStats] = await Promise.all([
      Producto.distinct('line', filtroBase).lean(),
      Producto.distinct('brand', filtroBase).lean(),
      Producto.distinct('model', { ...filtroBase, ...(brand ? {} : {}) }).lean(),
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

// Filtrar productos con búsqueda optimizada
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

    // Si hay un término de búsqueda, utilizar $text en lugar de $regex
    if (search) {
      filtro.$text = { $search: search };
    }

    // Definir qué campos retornar (proyección) si es necesario
    const projection = search ? { score: { $meta: "textScore" } } : {};

    // Definir opciones de ordenamiento
    const sortOptions = search 
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    const productosFiltrados = await Producto.find(filtro, projection)
      .sort(sortOptions)
      .lean(); // Usar lean

    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
