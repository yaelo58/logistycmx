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

// Obtener filtros dinámicos con lógica de filtros dependientes
exports.getFilters = async (req, res, next) => {
  try {
    const { line, brand } = req.query;

    const filtroBase = {
      ...(line && { line }),
      ...(brand && { brand }),
    };

    const [lines, brands, models, yearStats] = await Promise.all([
      Producto.distinct('line', filtroBase),
      Producto.distinct('brand', filtroBase),
      Producto.distinct('model', filtroBase),
      Producto.aggregate([
        { $match: filtroBase },
        {
          $group: {
            _id: null,
            minStartYear: { $min: '$startYear' },
            maxEndYear: { $max: '$endYear' },
          },
        },
      ]),
    ]);

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
    const filtro = [];

    if (line) filtro.push({ equals: { path: 'line', value: line } });
    if (brand) filtro.push({ equals: { path: 'brand', value: brand } });
    if (model) filtro.push({ equals: { path: 'model', value: model } });
    if (year) {
      filtro.push({
        range: {
          path: 'startYear',
          gte: Number(year),
        },
      });
      filtro.push({
        range: {
          path: 'endYear',
          lte: Number(year),
        },
      });
    }

    const searchStage = search
      ? {
          text: {
            query: search,
            path: ['description', 'code'], // Campos incluidos en el índice de búsqueda Atlas
            fuzzy: { maxEdits: 2 },
          },
        }
      : null;

    const aggregationPipeline = [
      {
        $search: {
          compound: {
            filter: filtro,
            ...(searchStage && { should: [searchStage] }),
          },
        },
      },
      { $limit: 100 }, // Limitar los resultados
      { $sort: { createdAt: -1 } },
    ];

    const productosFiltrados = await Producto.aggregate(aggregationPipeline);
    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};