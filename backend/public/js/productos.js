document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');
  
  // Elementos del recuadro (modal)
  const detalleProductoModal = document.getElementById('detalle-producto');
  const detalleProductoInfo = document.getElementById('detalle-producto-info');
  const cerrarDetalleBtn = document.getElementById('cerrar-detalle');

  // Filtros
  const filtroLine = document.getElementById('filtro-line');
  const filtroBrand = document.getElementById('filtro-brand');
  const filtroModel = document.getElementById('filtro-model');
  const filtroYear = document.getElementById('filtro-year');

  //---------------------------------------------
  // FUNCIONES AUXILIARES
  //---------------------------------------------
  // Obtener los valores seleccionados de los filtros (si existen)
  const getCurrentFilters = () => {
    const line = filtroLine.value.trim();
    const brand = filtroBrand.value.trim();
    const model = filtroModel.value.trim();
    const year = filtroYear.value.trim();

    // Solo devolvemos en el objeto aquellos que no estén vacíos
    const query = {};
    if (line) query.line = line;
    if (brand) query.brand = brand;
    if (model) query.model = model;
    if (year) query.year = year;
    return query;
  };

  // Arma la query string a partir de un objeto (line, brand, etc.)
  const buildQueryString = (params) => {
    const esc = encodeURIComponent;
    return Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');
  };

  // Crea la fila de la tabla para un producto
  const crearFilaProducto = ({ _id, codigo, description, price, stock, image }) => { // <-- Cambiado de 'code' a 'codigo'
    const fila = document.createElement('tr');
    const celdaImagen = document.createElement('td');
    const celdaCodigo = document.createElement('td'); // <-- Cambiado de 'celdaCode'
    const celdaDescription = document.createElement('td');
    const celdaPrice = document.createElement('td');
    const celdaStock = document.createElement('td');
    const celdaDetalles = document.createElement('td');

    celdaImagen.innerHTML = `<img src="${image}" alt="${codigo}" style="max-width: 100px; border-radius: 5px;">`; // <-- Cambiado de 'code' a 'codigo'
    celdaCodigo.textContent = codigo; // <-- Cambiado de 'code' a 'codigo'
    celdaDescription.textContent = description;
    celdaPrice.textContent = `$${price.toFixed(2)}`;
    celdaStock.textContent = stock;

    // Botón para ver detalles
    const botonDetalle = document.createElement('button');
    botonDetalle.classList.add('btn');
    botonDetalle.textContent = 'Ver Detalles';
    botonDetalle.addEventListener('click', () => {
      mostrarDetallesProducto(_id);
    });

    celdaDetalles.appendChild(botonDetalle);
    fila.appendChild(celdaImagen);
    fila.appendChild(celdaCodigo); // <-- Cambiado de 'celdaCode'
    fila.appendChild(celdaDescription);
    fila.appendChild(celdaPrice);
    fila.appendChild(celdaStock);
    fila.appendChild(celdaDetalles);

    return fila;
  };

  // Muestra mensaje (error o info)
  const mostrarMensaje = (mensaje, tipo = 'info') => {
    const mensajeElemento = document.createElement('p');
    mensajeElemento.textContent = mensaje;
    mensajeElemento.className = (tipo === 'error') ? 'mensaje-error' : 'mensaje-info';
    tablaProductosBody.appendChild(mensajeElemento);
  };

  // Llama a la API para obtener productos según filtros
  const cargarProductosFiltrados = async () => {
    const params = getCurrentFilters(); // line, brand, model, year
    const queryString = buildQueryString(params);
    
    try {
      // Mostrar "Cargando..." mientras fetch
      loadingMessage.style.display = 'block';
      tablaProductosBody.innerHTML = ''; // limpiamos la tabla

      const respuesta = await fetch(`/api/productos/filter?${queryString}`);
      loadingMessage.style.display = 'none';

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }
      const productos = await respuesta.json();

      if (productos.length === 0) {
        mostrarMensaje('No hay productos con los filtros seleccionados.', 'info');
        return;
      }

      productos.forEach(prod => {
        const filaProducto = crearFilaProducto(prod);
        tablaProductosBody.appendChild(filaProducto);
      });
    } catch (error) {
      loadingMessage.style.display = 'none';
      mostrarMensaje('Error al filtrar productos: ' + error.message, 'error');
      console.error(error);
    }
  };

  // Llama a la API para obtener los valores distinct de line, brand, model, year
  // basados en los filtros actuales (para que sean mutuamente excluyentes).
  const cargarOpcionesFiltros = async () => {
    const params = getCurrentFilters();
    const queryString = buildQueryString(params);

    try {
      const resp = await fetch(`/api/productos/filters?${queryString}`);
      if (!resp.ok) {
        throw new Error(`Error al cargar filtros: ${resp.statusText}`);
      }
      const data = await resp.json();
      const { lines, brands, models, years } = data;

      // line actual
      const currentLine = filtroLine.value;
      // brand actual
      const currentBrand = filtroBrand.value;
      // model actual
      const currentModel = filtroModel.value;
      // year actual
      const currentYear = filtroYear.value;

      // Llenar <select> de line
      filtroLine.innerHTML = '<option value="">-- Todas --</option>';
      lines.forEach(l => {
        const op = document.createElement('option');
        op.value = l;
        op.textContent = l;
        filtroLine.appendChild(op);
      });
      // Restaurar el valor si todavía existe
      if (lines.includes(currentLine)) {
        filtroLine.value = currentLine;
      }

      // Llenar <select> de brand
      filtroBrand.innerHTML = '<option value="">-- Todas --</option>';
      brands.forEach(b => {
        const op = document.createElement('option');
        op.value = b;
        op.textContent = b;
        filtroBrand.appendChild(op);
      });
      if (brands.includes(currentBrand)) {
        filtroBrand.value = currentBrand;
      }

      // Llenar <select> de model
      filtroModel.innerHTML = '<option value="">-- Todos --</option>';
      models.forEach(m => {
        const op = document.createElement('option');
        op.value = m;
        op.textContent = m;
        filtroModel.appendChild(op);
      });
      if (models.includes(currentModel)) {
        filtroModel.value = currentModel;
      }

      // Llenar <select> de year
      filtroYear.innerHTML = '<option value="">-- Todos --</option>';
      // Ordenar los años para que sean ascendentes
      years.sort((a, b) => a - b);
      years.forEach(y => {
        const op = document.createElement('option');
        op.value = y;
        op.textContent = y;
        filtroYear.appendChild(op);
      });
      if (years.includes(Number(currentYear))) {
        filtroYear.value = currentYear;
      }
    } catch (error) {
      console.error(error);
      alert('Error al cargar las opciones de filtros: ' + error.message);
    }
  };

  // Muestra el recuadro modal con detalles de un producto
  const mostrarDetallesProducto = async (idProducto) => {
    try {
      const respuesta = await fetch(`/api/productos/${idProducto}`);
      if (!respuesta.ok) {
        throw new Error(`Error al obtener producto: ${respuesta.statusText}`);
      }
      const producto = await respuesta.json();
      detalleProductoInfo.innerHTML = `
        <div class="detalle-producto-info-content">
          <div class="detalle-producto-image">
            <img src="${producto.image}" alt="${producto.codigo}">
          </div>
          <div class="detalle-producto-datos">
            <p><strong>Línea:</strong> ${producto.line}</p>
            <p><strong>Código:</strong> ${producto.code}</p>
            <p><strong>Descripción:</strong> ${producto.description}</p>
            <p><strong>Lado:</strong> ${producto.side}</p>
            <p><strong>Marca:</strong> ${producto.brand}</p>
            <p><strong>Modelo:</strong> ${producto.model}</p>
            <p><strong>Año:</strong> ${producto.year}</p>
            <p><strong>Precio:</strong> $${producto.price.toFixed(2)}</p>
            <p><strong>Existencia:</strong> ${producto.stock}</p>
          </div>
        </div>
      `;
      detalleProductoModal.classList.remove('oculto');
    } catch (error) {
      console.error('Error al mostrar detalles:', error);
      alert('No se pudieron cargar los detalles de este producto.');
    }
  };

  //---------------------------------------------
  // EVENTOS
  //---------------------------------------------
  // Cuando cierra el modal
  cerrarDetalleBtn.addEventListener('click', () => {
    detalleProductoModal.classList.add('oculto');
  });

  // Cada que cambie un filtro, recargamos las opciones y los productos
  filtroLine.addEventListener('change', async () => {
    await cargarOpcionesFiltros();
    await cargarProductosFiltrados();
  });
  filtroBrand.addEventListener('change', async () => {
    await cargarOpcionesFiltros();
    await cargarProductosFiltrados();
  });
  filtroModel.addEventListener('change', async () => {
    await cargarOpcionesFiltros();
    await cargarProductosFiltrados();
  });
  filtroYear.addEventListener('change', async () => {
    await cargarOpcionesFiltros();
    await cargarProductosFiltrados();
  });

  //---------------------------------------------
  // INICIALIZACIÓN
  //---------------------------------------------
  (async function init() {
    // 1) Cargar opciones de filtros (sin selección previa).
    await cargarOpcionesFiltros();
    // 2) Cargar productos filtrados (ningún filtro al inicio).
    await cargarProductosFiltrados();
  })();
});
