// backend/controllers/productosController.js

const Producto = require('../models/Producto');

// Obtener todos los productos con paginación opcional
exports.getAllProductos = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const productos = await Producto.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

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

// Obtener filtros dinámicos con lógica de filtros dependientes (Optimizado)
exports.getFilters = async (req, res, next) => {
  try {
    const { line, brand } = req.query;

    const filtroBase = {
      ...(line && { line }),
      ...(brand && { brand }),
    };

    const aggregationPipeline = [
      { $match: filtroBase },
      {
        $facet: {
          lines: [{ $group: { _id: "$line" } }, { $sort: { _id: 1 } }],
          brands: [{ $group: { _id: "$brand" } }, { $sort: { _id: 1 } }],
          models: [
            ...(brand
              ? [{ $group: { _id: "$model" } }, { $sort: { _id: 1 } }]
              : [{ $group: { _id: "$model" } }, { $sort: { _id: 1 } }])
          ],
          yearStats: [
            {
              $group: {
                _id: null,
                minStartYear: { $min: "$startYear" },
                maxEndYear: { $max: "$endYear" },
              },
            },
          ],
        },
      },
    ];

    const result = await Producto.aggregate(aggregationPipeline).exec();

    const lines = result[0].lines.map(item => item._id);
    const brands = result[0].brands.map(item => item._id);
    const models = result[0].models.map(item => item._id);
    const minYear = result[0].yearStats[0]?.minStartYear || null;
    const maxYear = result[0].yearStats[0]?.maxEndYear || null;

    res.json({ lines, brands, models, minYear, maxYear });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos con búsqueda optimizada
exports.filterProductos = async (req, res, next) => {
  try {
    const { line, brand, model, year, search, page = 1, limit = 20 } = req.query;
    const filtro = {
      ...(line && { line }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && { 
        startYear: { $lte: Number(year) }, 
        endYear: { $gte: Number(year) } 
      }),
    };

    // Si hay un término de búsqueda, usar $text
    let sort = { createdAt: -1 };
    if (search) {
      filtro.$text = { $search: search };
      sort = { score: { $meta: "textScore" }, createdAt: -1 };
    }

    const productosFiltrados = await Producto.find(filtro, search ? { score: { $meta: "textScore" } } : {})
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
