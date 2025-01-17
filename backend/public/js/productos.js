// backend/public/js/productos.js

document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');
  const detalleProductoModal = document.getElementById('detalle-producto');
  const detalleProductoInfo = document.getElementById('detalle-producto-info');
  const cerrarDetalleBtn = document.getElementById('cerrar-detalle');

  // Filtros
  const filtros = {
    line: document.getElementById('filtro-line'),
    brand: document.getElementById('filtro-brand'),
    model: document.getElementById('filtro-model'),
    year: document.getElementById('filtro-year'),
  };

  //---------------------------------------------
  // FUNCIONES AUXILIARES
  //---------------------------------------------

  // Obtiene los filtros actuales seleccionados
  const getCurrentFilters = () => {
    return Object.entries(filtros).reduce((acc, [key, element]) => {
      const value = element.value.trim();
      if (value) acc[key] = key === 'year' ? Number(value) : value;
      return acc;
    }, {});
  };

  // Construye una cadena de consulta a partir de los parámetros
  const buildQueryString = (params) => {
    return new URLSearchParams(params).toString();
  };

  // Crea una fila de producto en la tabla
  const crearFilaProducto = ({ _id, code, description, price, stock, image }) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td><img src="${image}" alt="${code}" style="max-width: 100px; border-radius: 5px;"></td>
      <td>${code}</td>
      <td>${description}</td>
      <td>$${price.toFixed(2)}</td>
      <td>${stock}</td>
      <td><button class="btn btn-detalle" data-id="${_id}">Ver Detalles</button></td>
    `;

    return fila;
  };

  // Muestra un mensaje en la tabla (por ejemplo, sin resultados o error)
  const mostrarMensaje = (mensaje, tipo = 'info') => {
    const mensajeElemento = document.createElement('p');
    mensajeElemento.textContent = mensaje;
    mensajeElemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-info';
    tablaProductosBody.appendChild(mensajeElemento);
  };

  // Carga y muestra los productos filtrados
  const cargarProductosFiltrados = async () => {
    const params = getCurrentFilters();
    const queryString = buildQueryString(params);

    try {
      loadingMessage.style.display = 'block';
      tablaProductosBody.innerHTML = '';

      const respuesta = await fetch(`/api/productos/filter?${queryString}`);
      loadingMessage.style.display = 'none';

      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);

      const productos = await respuesta.json();

      if (productos.length === 0) {
        mostrarMensaje('No hay productos con los filtros seleccionados.', 'info');
        return;
      }

      const fragment = document.createDocumentFragment();
      productos.forEach(prod => {
        const fila = crearFilaProducto(prod);
        fragment.appendChild(fila);
      });
      tablaProductosBody.appendChild(fragment);
    } catch (error) {
      loadingMessage.style.display = 'none';
      mostrarMensaje(`Error al filtrar productos: ${error.message}`, 'error');
      console.error(error);
    }
  };

  // Carga las opciones de los filtros basándose en los filtros actuales
  const cargarOpcionesFiltros = async (filtroActual = {}) => {
    const queryString = buildQueryString(filtroActual);

    try {
      const respuesta = await fetch(`/api/productos/filters?${queryString}`);
      if (!respuesta.ok) throw new Error(`Error al cargar filtros: ${respuesta.statusText}`);

      const { lines, brands, models, minYear, maxYear } = await respuesta.json();

      // Llenar el filtro de líneas (si existe)
      if (lines) {
        llenarSelect(filtros.line, lines, '-- Todas --');
      }

      // Llenar el filtro de marcas
      if (brands) {
        llenarSelect(filtros.brand, brands, '-- Todas --');
        // Habilitar el filtro de marcas si hay opciones disponibles
        filtros.brand.disabled = brands.length === 0;
      }

      // Llenar el filtro de modelos
      if (models) {
        llenarSelect(filtros.model, models, '-- Todos --');
        // Habilitar el filtro de modelos solo si se ha seleccionado una marca
        filtros.model.disabled = !filtros.brand.value || models.length === 0;
      } else {
        filtros.model.innerHTML = `<option value="">-- Todos --</option>`;
        filtros.model.disabled = true;
      }

      // Llenar el filtro de años
      if (minYear && maxYear) {
        let allYearsArray = [];
        for (let year = minYear; year <= maxYear; year++) {
          allYearsArray.push(year);
        }
        llenarSelect(filtros.year, allYearsArray, '-- Todos --', true);
        // Habilitar el filtro de años solo si se han seleccionado marca y modelo
        filtros.year.disabled = !(filtros.brand.value && filtros.model.value);
      } else {
        filtros.year.innerHTML = `<option value="">-- Todos --</option>`;
        filtros.year.disabled = true;
      }
    } catch (error) {
      console.error(error);
      alert(`Error al cargar las opciones de filtros: ${error.message}`);
    }
  };

  // Llena un elemento select con opciones
  const llenarSelect = (selectElement, opciones, defaultText, isNumber = false) => {
    const currentValue = selectElement.value;
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    opciones.forEach(op => {
      const option = document.createElement('option');
      option.value = op;
      option.textContent = op;
      selectElement.appendChild(option);
    });
    if (isNumber && !isNaN(currentValue) && opciones.includes(Number(currentValue))) {
      selectElement.value = currentValue;
    } else if (opciones.includes(currentValue)) {
      selectElement.value = currentValue;
    } else {
      selectElement.value = '';
    }
  };

  // Muestra los detalles de un producto en un modal
  const mostrarDetallesProducto = async (idProducto) => {
    try {
      const respuesta = await fetch(`/api/productos/${idProducto}`);
      if (!respuesta.ok) throw new Error(`Error al obtener producto: ${respuesta.statusText}`);

      const producto = await respuesta.json();
      detalleProductoInfo.innerHTML = `
        <div class="detalle-producto-info-content">
          <div class="detalle-producto-image">
            <img src="${producto.image}" alt="${producto.code}">
          </div>
          <div class="detalle-producto-datos">
            <p><strong>Línea:</strong> ${producto.line}</p>
            <p><strong>Código:</strong> ${producto.code}</p>
            <p><strong>Descripción:</strong> ${producto.description}</p>
            <p><strong>Lado:</strong> ${producto.side}</p>
            <p><strong>Marca:</strong> ${producto.brand}</p>
            <p><strong>Modelo:</strong> ${producto.model}</p>
            <p><strong>Años Activos:</strong> ${producto.startYear} - ${producto.endYear}</p>
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
  cerrarDetalleBtn.addEventListener('click', () => {
    detalleProductoModal.classList.add('oculto');
  });

  // Delegación de eventos para botones de detalle
  tablaProductosBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-detalle')) {
      const idProducto = e.target.getAttribute('data-id');
      mostrarDetallesProducto(idProducto);
    }
  });

  // Eventos para filtros
  filtros.line.addEventListener('change', async () => {
    // Al cambiar la línea, reiniciar marca, modelo y año
    filtros.brand.value = '';
    filtros.model.innerHTML = `<option value="">-- Todos --</option>`;
    filtros.model.disabled = true;
    filtros.year.innerHTML = `<option value="">-- Todos --</option>`;
    filtros.year.disabled = true;

    // Si se selecciona una línea, habilitar y cargar marcas
    if (filtros.line.value) {
      await cargarOpcionesFiltros({ line: filtros.line.value });
    } else {
      // Si no se selecciona ninguna línea, deshabilitar y resetear filtros dependientes
      filtros.brand.disabled = true;
      filtros.model.disabled = true;
      filtros.year.disabled = true;
    }
    await cargarProductosFiltrados();
  });

  filtros.brand.addEventListener('change', async () => {
    // Al cambiar la marca, reiniciar modelo y año
    filtros.model.value = '';
    filtros.year.innerHTML = `<option value="">-- Todos --</option>`;
    filtros.year.disabled = true;

    // Si se selecciona una marca, habilitar y cargar modelos
    if (filtros.brand.value) {
      const filtroActual = {
        ...(filtros.line.value && { line: filtros.line.value }),
        brand: filtros.brand.value,
      };
      await cargarOpcionesFiltros(filtroActual);
    } else {
      // Si no se selecciona ninguna marca, deshabilitar y resetear filtros dependientes
      filtros.model.disabled = true;
      filtros.year.disabled = true;
    }
    await cargarProductosFiltrados();
  });

  filtros.model.addEventListener('change', async () => {
    // Al cambiar el modelo, reiniciar año
    filtros.year.value = '';

    // Si se selecciona un modelo, habilitar y cargar años
    if (filtros.model.value) {
      const filtroActual = {
        ...(filtros.line.value && { line: filtros.line.value }),
        ...(filtros.brand.value && { brand: filtros.brand.value }),
        model: filtros.model.value,
      };
      await cargarOpcionesFiltros(filtroActual);
    } else {
      // Si no se selecciona ningún modelo, deshabilitar y resetear filtro de año
      filtros.year.disabled = true;
    }
    await cargarProductosFiltrados();
  });

  filtros.year.addEventListener('change', async () => {
    // No hay filtros dependientes posteriores
    await cargarProductosFiltrados();
  });

  //---------------------------------------------
  // INICIALIZACIÓN
  //---------------------------------------------
  (async function init() {
    await cargarOpcionesFiltros();
    await cargarProductosFiltrados();
  })();
});
