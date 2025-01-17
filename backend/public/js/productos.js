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

  const getCurrentFilters = () => {
    return Object.entries(filtros).reduce((acc, [key, element]) => {
      const value = element.value.trim();
      if (value) acc[key] = key === 'year' ? Number(value) : value;
      return acc;
    }, {});
  };

  const buildQueryString = (params) => {
    return new URLSearchParams(params).toString();
  };

  // Función para crear filas de productos
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

  const mostrarMensaje = (mensaje, tipo = 'info') => {
    const mensajeElemento = document.createElement('p');
    mensajeElemento.textContent = mensaje;
    mensajeElemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-info';
    tablaProductosBody.appendChild(mensajeElemento);
  };

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

  const cargarOpcionesFiltros = async () => {
    const params = {
      ...(filtros.line.value && { line: filtros.line.value }),
      ...(filtros.brand.value && { brand: filtros.brand.value }),
    };
    const queryString = buildQueryString(params);

    try {
      const respuesta = await fetch(`/api/productos/filters?${queryString}`);
      if (!respuesta.ok) throw new Error(`Error al cargar filtros: ${respuesta.statusText}`);

      const { lines, brands, models, minYear, maxYear } = await respuesta.json();
      llenarSelect(filtros.line, lines, '-- Todas --');
      llenarSelect(filtros.brand, brands, '-- Todas --');
      llenarSelect(filtros.model, models, '-- Todos --');
      llenarSelect(filtros.year, generarRangoAnios(minYear, maxYear), '-- Todos --', true);

      // Habilitar o deshabilitar selectores basados en selecciones
      toggleSelects();
    } catch (error) {
      console.error(error);
      alert(`Error al cargar las opciones de filtros: ${error.message}`);
    }
  };

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

  const generarRangoAnios = (min, max) => {
    if (!min || !max) return [];
    const anios = [];
    for (let year = min; year <= max; year++) {
      anios.push(year);
    }
    return anios;
  };

  const toggleSelects = () => {
    // Habilitar o deshabilitar Modelo basado en Marca
    if (filtros.brand.value) {
      filtros.model.disabled = false;
    } else {
      filtros.model.disabled = true;
      filtros.model.value = '';
      filtros.year.disabled = true;
      filtros.year.value = '';
    }

    // Habilitar o deshabilitar Año basado en Modelo
    if (filtros.model.value) {
      filtros.year.disabled = false;
    } else {
      filtros.year.disabled = true;
      filtros.year.value = '';
    }
  };

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
  Object.values(filtros).forEach(filtro => {
    filtro.addEventListener('change', async () => {
      await cargarOpcionesFiltros();
      await cargarProductosFiltrados();
    });
  });

  //---------------------------------------------
  // INICIALIZACIÓN
  //---------------------------------------------
  (async function init() {
    await cargarOpcionesFiltros();
    await cargarProductosFiltrados();
  })();
});
