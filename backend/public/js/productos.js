// productos.js

document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');

  // Crear fila de producto
  const crearFilaProducto = ({ _id, nombre, descripcion, precio, imagen }) => {
    // Crea la fila
    const fila = document.createElement('tr');

    // Crea las celdas de la fila
    const celdaImagen = document.createElement('td');
    const celdaNombre = document.createElement('td');
    const celdaDescripcion = document.createElement('td');
    const celdaPrecio = document.createElement('td');
    const celdaDetalles = document.createElement('td');

    // Configurar contenido de cada celda
    celdaImagen.innerHTML = `<img src="${imagen}" alt="${nombre}" style="max-width: 100px; border-radius: 5px;">`;
    celdaNombre.textContent = nombre;
    celdaDescripcion.textContent = descripcion;
    celdaPrecio.textContent = `$${precio.toFixed(2)}`;

    // Agregar un enlace o botón para ver más detalles
    const enlaceDetalle = document.createElement('a');
    enlaceDetalle.href = `detalle-producto.html?id=${_id}`;
    enlaceDetalle.classList.add('btn');
    enlaceDetalle.textContent = 'Ver Más';

    celdaDetalles.appendChild(enlaceDetalle);

    // Agregar las celdas a la fila
    fila.appendChild(celdaImagen);
    fila.appendChild(celdaNombre);
    fila.appendChild(celdaDescripcion);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaDetalles);

    return fila;
  };

  // Mostrar mensaje (info o error)
  const mostrarMensaje = (mensaje, tipo = 'info') => {
    const mensajeElemento = document.createElement('p');
    mensajeElemento.textContent = mensaje;
    mensajeElemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-info';
    // Insertamos el mensaje en el tbody para que aparezca debajo de la tabla
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
      
      // Ocultamos el mensaje de carga
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

  cargarProductos();
});
