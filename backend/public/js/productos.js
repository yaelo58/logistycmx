document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');

  // Elementos del recuadro (modal)
  const detalleProductoModal = document.getElementById('detalle-producto');
  const detalleProductoInfo = document.getElementById('detalle-producto-info');
  const cerrarDetalleBtn = document.getElementById('cerrar-detalle');

  // Función para mostrar el recuadro con detalles de un producto
  const mostrarDetallesProducto = async (idProducto) => {
    try {
      // Llamada a la API para obtener los datos completos
      const respuesta = await fetch(`/api/productos/${idProducto}`);
      if (!respuesta.ok) {
        throw new Error(`Error al obtener producto: ${respuesta.statusText}`);
      }
      const producto = await respuesta.json();

      // Rellenamos el recuadro con TODOS los atributos y un estilo más agradable
      detalleProductoInfo.innerHTML = `
        <div class="detalle-producto-info-content">
          <div class="detalle-producto-image">
            <img 
              src="${producto.image}" 
              alt="${producto.code}"
            >
          </div>
          <div class="detalle-producto-datos">
            <p><strong>Line:</strong> ${producto.line}</p>
            <p><strong>Code:</strong> ${producto.code}</p>
            <p><strong>Description:</strong> ${producto.description}</p>
            <p><strong>Side:</strong> ${producto.side}</p>
            <p><strong>Brand:</strong> ${producto.brand}</p>
            <p><strong>Model:</strong> ${producto.model}</p>
            <p><strong>Year:</strong> ${producto.year}</p>
            <p><strong>Price:</strong> $${producto.price.toFixed(2)}</p>
            <p><strong>Stock:</strong> ${producto.stock}</p>
          </div>
        </div>
      `;

      // Quitamos la clase "oculto" para mostrar el modal
      detalleProductoModal.classList.remove('oculto');

    } catch (error) {
      console.error('Error al mostrar detalles:', error);
      alert('No se pudieron cargar los detalles de este producto.');
    }
  };

  // Crear fila de producto con los campos que se muestran en la tabla
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
    celdaImagen.innerHTML = `
      <img src="${image}" alt="${code}" 
           style="max-width: 100px; border-radius: 5px;">
    `;
    celdaCode.textContent = code;
    celdaDescription.textContent = description;
    celdaPrice.textContent = `$${price.toFixed(2)}`;
    celdaStock.textContent = stock;

    // Botón para ver detalles
    const botonDetalle = document.createElement('button');
    botonDetalle.classList.add('btn');
    botonDetalle.textContent = 'Ver Detalles';
    // Evento para mostrar detalles en el recuadro
    botonDetalle.addEventListener('click', () => {
      mostrarDetallesProducto(_id);
    });

    // Agregar el botón a la celda
    celdaDetalles.appendChild(botonDetalle);

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
        const filaProducto = crearFilaProducto(producto);
        tablaProductosBody.appendChild(filaProducto);
      });

    } catch (error) {
      loadingMessage.style.display = 'none';
      mostrarMensaje('No se pudieron cargar los productos. Por favor, intenta más tarde.', 'error');
      console.error(error);
    }
  };

  // Cerrar el recuadro de detalles al hacer clic en el botón "Cerrar"
  cerrarDetalleBtn.addEventListener('click', () => {
    detalleProductoModal.classList.add('oculto');
  });

  // Ejecutar la carga de productos al cargar la página
  cargarProductos();
});
