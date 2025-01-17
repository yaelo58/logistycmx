// backend/controllers/productosController.js

const Producto = require('../models/Producto');

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

    if (search) {
      filtro.$text = { $search: search };
    }

    // Definir opciones de ordenamiento
    const sortOptions = search ? { score: { $meta: "textScore" } } : { createdAt: -1 };

    // Definir proyección para incluir campos necesarios
    const projection = search 
      ? { 
          score: { $meta: "textScore" },
          line: 1,
          code: 1,
          description: 1,
          side: 1,
          brand: 1,
          model: 1,
          startYear: 1,
          endYear: 1,
          price: 1,
          stock: 1,
          image: 1 
        } 
      : {};

    const productosFiltrados = await Producto.find(filtro, projection)
      .sort(sortOptions)
      .lean(); // Uso de lean() para consultas más rápidas

    res.json(productosFiltrados);
  } catch (error) {
    next(error);
  }
};
