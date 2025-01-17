// backend/controllers/productosController.js

const Producto = require('../models/Producto');

// Obtener todos los productos con paginación opcional
exports.getAllProductos = async (req, res, next) => {
  try {
    const productos = await Producto.find()
      .sort({ createdAt: -1 })
      .lean(); // Mejora el rendimiento al devolver objetos simples
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id).lean();
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

    const agregacion = [
      { $match: filtroBase },
      {
        $facet: {
          lines: [{ $group: { _id: "$line" } }, { $sort: { _id: 1 } }],
          brands: [{ $group: { _id: "$brand" } }, { $sort: { _id: 1 } }],
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
    ];

    const resultado = await Producto.aggregate(agregacion).exec();

    const { lines, brands, models, yearStats } = resultado[0];

    // Extraer valores
    const linesList = lines.map(item => item._id);
    const brandsList = brands.map(item => item._id);
    const modelsList = models.map(item => item._id);
    const minYear = yearStats[0]?.minStartYear || null;
    const maxYear = yearStats[0]?.maxEndYear || null;

    res.json({ lines: linesList, brands: brandsList, models: modelsList, minYear, maxYear });
  } catch (error) {
    next(error);
  }
};

// Filtrar productos con búsqueda
exports.filterProductos = async (req, res, next) => {
  try {
    const { line, brand, model, year, search } = req.query;
    const filtro = {
      ...(line && { line }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(year && { 
        startYear: { $lte: Number(year) }, 
        endYear: { $gte: Number(year) } 
      }),
    };

    // Si hay un término de búsqueda, utilizar búsqueda de texto
    if (search) {
      filtro.$text = { $search: search };
    }

    // Opcional: Proyectar la puntuación de texto si se usa búsqueda de texto
    const projection = search ? { score: { $meta: "textScore" } } : {};

    // Definir opciones de ordenamiento
    const sortOption = search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 };

    const productosFiltrados = await Producto.find(filtro, projection)
      .sort(sortOption)
      .lean(); // Mejora el rendimiento al devolver objetos simples

    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
