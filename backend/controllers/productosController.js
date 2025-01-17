const Producto = require('../models/Producto');

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const producto = new Producto(req.body);
    const productoGuardado = await producto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el producto' });
  }
};

// Obtener filtros dinámicos
exports.getFilters = async (req, res) => {
  try {
    const { line, brand, model, year } = req.query;
    const filtro = { ...(line && { line }), ...(brand && { brand }), ...(model && { model }), ...(year && { year: Number(year) }) };

    const [lines, brands, models, years] = await Promise.all([
      Producto.distinct('line', filtro),
      Producto.distinct('brand', filtro),
      Producto.distinct('model', filtro),
      Producto.distinct('year', filtro),
    ]);

    res.json({ lines, brands, models, years });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener filtros' });
  }
};

// Filtrar productos
exports.filterProductos = async (req, res) => {
  try {
    const { line, brand, model, year } = req.query;
    const filtro = { ...(line && { line }), ...(brand && { brand }), ...(model && { model }), ...(year && { year: Number(year) }) };

    const productosFiltrados = await Producto.find(filtro);
    res.json(productosFiltrados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al filtrar productos' });
  }
};
