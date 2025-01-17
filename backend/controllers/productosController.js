const Producto = require('../models/Producto');

// Obtener todos los productos
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
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'El código del producto ya existe.' });
    }
    next(error);
  }
};

// Obtener filtros dinámicos optimizados
exports.getFilters = async (req, res, next) => {
  try {
    const { line, brand } = req.query;

    const filtroBase = {
      ...(line && { line }),
      ...(brand && { brand }),
    };

    // Usamos $facet para obtener todos los filtros en una sola consulta
    const filtros = await Producto.aggregate([
      { $match: filtroBase },
      {
        $facet: {
          lines: [{ $sortByCount: "$line" }], // Contar líneas
          brands: [{ $sortByCount: "$brand" }], // Contar marcas
          models: [
            { $group: { _id: "$model" } },
            { $sort: { _id: 1 } },
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
    ]);

    const { lines, brands, models, yearStats } = filtros[0];
    const minYear = yearStats[0]?.minStartYear || null;
    const maxYear = yearStats[0]?.maxEndYear || null;

    res.json({
      lines: lines.map((item) => item._id),
      brands: brands.map((item) => item._id),
      models: models.map((item) => item._id),
      minYear,
      maxYear,
    });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos optimizado
exports.filterProductos = async (req, res, next) => {
  try {
    const { line, brand, model, year, search } = req.query;

    const filtro = {
      ...(line && { line }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && {
        startYear: { $lte: Number(year) },
        endYear: { $gte: Number(year) },
      }),
    };

    if (search) {
      filtro.$text = { $search: search }; // Búsqueda con índice de texto
    }

    const productosFiltrados = await Producto.aggregate([
      { $match: filtro },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          line: 1,
          brand: 1,
          model: 1,
          description: 1,
          code: 1,
          price: 1,
          stock: 1,
          image: 1,
        },
      },
    ]);

    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
