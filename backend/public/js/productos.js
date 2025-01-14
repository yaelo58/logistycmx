// backend/public/js/productos.js

document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');

  // Crear fila de producto con los nuevos campos
  // Omitimos 'grupo' para no mostrarlo
  const crearFilaProducto = ({ _id, codigo, descripcion, marca, modelo, precio, existencia, imagen }) => {
    const fila = document.createElement('tr');

    // Crear celdas
    const celdaImagen = document.createElement('td');
    const celdaCodigo = document.createElement('td');
    const celdaMarca = document.createElement('td');
    const celdaModelo = document.createElement('td');
    const celdaDescripcion = document.createElement('td');
    const celdaPrecio = document.createElement('td');
    const celdaExistencia = document.createElement('td');
    const celdaDetalles = document.createElement('td');

    // Contenido de cada celda
    // Imagen
    celdaImagen.innerHTML = `<img src="${imagen}" alt="${codigo}" style="max-width: 100px; border-radius: 5px;">`;

    // Código
    celdaCodigo.textContent = codigo;

    // Marca
    celdaMarca.textContent = marca;

    // Modelo
    celdaModelo.textContent = modelo;

    // Descripción
    celdaDescripcion.textContent = descripcion;

    // Precio (con decimales fijos)
    celdaPrecio.textContent = `$${precio.toFixed(2)}`;

    // Existencia
    celdaExistencia.textContent = existencia;

    // Agregar un botón o enlace para más detalles
    const enlaceDetalle = document.createElement('a');
    enlaceDetalle.href = `detalle-producto.html?id=${_id}`;
    enlaceDetalle.classList.add('btn');
    enlaceDetalle.textContent = 'Ver Más';
    celdaDetalles.appendChild(enlaceDetalle);

    // Agregar las celdas a la fila
    fila.appendChild(celdaImagen);
    fila.appendChild(celdaCodigo);
    fila.appendChild(celdaMarca);
    fila.appendChild(celdaModelo);
    fila.appendChild(celdaDescripcion);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaExistencia);
    fila.appendChild(celdaDetalles);

    return fila;
  };

  // Mostrar mensaje en la tabla (por ejemplo, error o info)
  const mostrarMensaje = (mensaje, tipo = 'info') => {
    const mensajeElemento = document.createElement('p');
    mensajeElemento.textContent = mensaje;
    mensajeElemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-info';
    tablaProductosBody.appendChild(mensajeElemento);
  };

  // Cargar productos desde la API
  const cargarProductos = async () => {
    try {
      const respuesta = await fetch('/api/productos');
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }
      const productos = await respuesta.json();

      // Ocultar mensaje de "Cargando..."
      loadingMessage.style.display = 'none';

      if (productos.length === 0) {
        mostrarMensaje('No hay productos disponibles en este momento.', 'info');
        return;
      }

      // Crear una fila por cada producto
      productos.forEach(producto => {
        const filaProducto = crearFilaProducto(producto);
        tablaProductosBody.appendChild(filaProducto);
      });

    } catch (error) {
      loadingMessage.style.display = 'none';
      mostrarMensaje('No se pudieron cargar los productos. Por favor, intenta más tarde.', 'error');
      console.error(error);
    }
  };

  // Ejecutar la carga de productos al cargar la página
  cargarProductos();
});
