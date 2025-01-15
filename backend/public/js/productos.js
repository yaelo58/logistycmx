document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');

  // Crear fila de producto con los campos que sí vamos a mostrar en la tabla
  const crearFilaProducto = ({ _id, code, description, price, stock, image }) => {
    const fila = document.createElement('tr');

    // Crear celdas
    const celdaImagen = document.createElement('td');
    const celdaCode = document.createElement('td');
    const celdaDescription = document.createElement('td');
    const celdaPrice = document.createElement('td');
    const celdaStock = document.createElement('td');
    const celdaDetalles = document.createElement('td');

    // Contenido de cada celda

    // Imagen
    celdaImagen.innerHTML = `<img src="${image}" alt="${code}" style="max-width: 100px; border-radius: 5px;">`;

    // Code
    celdaCode.textContent = code;

    // Description
    celdaDescription.textContent = description;

    // Price (con decimales fijos)
    celdaPrice.textContent = `$${price.toFixed(2)}`;

    // Stock
    celdaStock.textContent = stock;

    // Agregar un botón o enlace para más detalles
    const enlaceDetalle = document.createElement('a');
    enlaceDetalle.href = `detalle-producto.html?id=${_id}`;
    enlaceDetalle.classList.add('btn');
    enlaceDetalle.textContent = 'Ver Más';
    celdaDetalles.appendChild(enlaceDetalle);

    // Agregar las celdas a la fila
    fila.appendChild(celdaImagen);
    fila.appendChild(celdaCode);
    fila.appendChild(celdaDescription);
    fila.appendChild(celdaPrice);
    fila.appendChild(celdaStock);
    fila.appendChild(celdaDetalles);

    return fila;
  };

  // Mostrar mensaje (por ejemplo, error o info)
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
        // Omitimos line, side, brand, model, year en la tabla
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
