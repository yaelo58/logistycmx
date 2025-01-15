require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Configuración de Helmet con Content Security Policy (CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "'unsafe-inline'",
        ],
        connectSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
        ],
        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
        ],
        imgSrc: ["'self'", "data:", "https://*"],
        frameSrc: ["'self'", "https://www.google.com"],
      },
    },
  })
);

// Configuración de CORS
app.use(cors({ origin: '*' }));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
const productsRoute = require('./routes/products');
app.use('/api/products', productsRoute);

// Manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Página no encontrada.' });
});

// Manejar errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

// Conectar a MongoDB y arrancar el servidor
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

startServer();
