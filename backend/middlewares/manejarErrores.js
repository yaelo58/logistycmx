module.exports = (err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  
  // Manejo de errores específicos
  if (err.name === 'ValidationError') {
    return res.status(400).json({ mensaje: err.message });
  }

  res.status(500).json({ mensaje: 'Error interno del servidor.' });
};
