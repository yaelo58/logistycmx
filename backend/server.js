// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const productosRuta = require('./routes/productos');
const manejarErrores = require('./middlewares/manejarErrores');

const app = express();

// Middleware de Seguridad
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
app.use(cors());

// Middleware para parsear JSON
app.use(express.json({ limit: '10kb' })); // Limita el tamaño de las solicitudes JSON

// Middleware para parsear URL-encoded data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Servir archivos estáticos con cache control mejorado
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Ajusta según tus necesidades
  etag: false,
}));

// Rutas de la API
app.use('/api/productos', productosRuta);

// Manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ mensaje: 'Página no encontrada.' });
});

// Middleware de manejo de errores
app.use(manejarErrores);

// Conectar a MongoDB y arrancar el servidor
const iniciarServidor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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

iniciarServidor();