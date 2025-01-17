const Producto = require('../models/Producto');

// Obtener todos los productos con paginación opcional
exports.getAllProductos = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query; // Parámetros de paginación

    const productos = await Producto.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-__v')
      .lean();

    const total = await Producto.countDocuments();

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      productos,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id).select('-__v').lean();
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

    const filtroBase = {};
    if (line) filtroBase.line = line;
    if (brand) filtroBase.brand = brand;

    const aggregationPipeline = [
      { $match: filtroBase },
      {
        $group: {
          _id: null,
          lines: { $addToSet: "$line" },
          brands: { $addToSet: "$brand" },
          models: { $addToSet: "$model" },
          minStartYear: { $min: "$startYear" },
          maxEndYear: { $max: "$endYear" },
        },
      },
      {
        $project: {
          _id: 0,
          lines: 1,
          brands: 1,
          models: 1,
          minStartYear: 1,
          maxEndYear: 1,
        },
      },
    ];

    const result = await Producto.aggregate(aggregationPipeline).exec();

    if (result.length === 0) {
      return res.json({ lines: [], brands: [], models: [], minYear: null, maxYear: null });
    }

    const { lines, brands: brandList, models, minStartYear, maxEndYear } = result[0];

    res.json({
      lines,
      brands: brandList,
      models,
      minYear: minStartYear,
      maxYear: maxEndYear,
    });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos con búsqueda y paginación
exports.filterProductos = async (req, res, next) => {
  try {
    const { line, brand, model, year, search, page = 1, limit = 20 } = req.query;

    const filtro = {};

    if (line) filtro.line = line;
    if (brand) filtro.brand = brand;
    if (model) filtro.model = model;
    if (year) {
      filtro.startYear = { $lte: Number(year) };
      filtro.endYear = { $gte: Number(year) };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filtro.$or = [
        { description: regex },
        { code: regex },
      ];
    }

    const [productosFiltrados, total] = await Promise.all([
      Producto.find(filtro)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-__v')
        .lean(),
      Producto.countDocuments(filtro),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      productos: productosFiltrados,
    });
  } catch (error) {
    next(error);
  }
};
