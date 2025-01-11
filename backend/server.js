// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS (ajusta el origen según tu entorno)
app.use(cors({
    origin: 'http://localhost:5500', // Cambia esto al dominio de tu frontend en producción
}));

// Middleware para limitar solicitudes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por IP
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.'
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json());

// Rutas
const productosRuta = require('./routes/productos');
app.use('/api/productos', productosRuta);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado a MongoDB');
    // Iniciar el servidor después de conectar a la base de datos
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar a MongoDB:', err);
});
