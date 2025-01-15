document.addEventListener("DOMContentLoaded", () => {
  const tablaProductosBody = document.getElementById('tabla-productos-body');
  const loadingMessage = document.getElementById('loading-message');

  // Crear fila de producto (solo con los campos que se muestran en la tabla)
  const createProductRow = ({ _id, code, description, price, stock, image }) => {
    const row = document.createElement('tr');

    // celdas
    const cellImage = document.createElement('td');
    const cellCode = document.createElement('td');
    const cellDescription = document.createElement('td');
    const cellPrice = document.createElement('td');
    const cellStock = document.createElement('td');
    const cellDetails = document.createElement('td');

    // imagen
    cellImage.innerHTML = `<img src="${image}" 
                                alt="${code}"
                                style="max-width: 100px; border-radius: 5px;">`;

    // código
    cellCode.textContent = code;

    // descripción
    cellDescription.textContent = description;

    // precio
    cellPrice.textContent = `$${price.toFixed(2)}`;

    // existencia
    cellStock.textContent = stock;

    // botón de detalles (enlace a detalle-producto.html, por ejemplo)
    const detailsLink = document.createElement('a');
    detailsLink.href = `detalle-producto.html?id=${_id}`;
    detailsLink.classList.add('btn');
    detailsLink.textContent = 'Ver Más';
    cellDetails.appendChild(detailsLink);

    // agregar las celdas al row
    row.appendChild(cellImage);
    row.appendChild(cellCode);
    row.appendChild(cellDescription);
    row.appendChild(cellPrice);
    row.appendChild(cellStock);
    row.appendChild(cellDetails);

    return row;
  };

  // Mostrar mensaje en la tabla
  const showMessage = (message, type = 'info') => {
    const msgElement = document.createElement('p');
    msgElement.textContent = message;
    msgElement.className = type === 'error' ? 'mensaje-error' : 'mensaje-info';
    tablaProductosBody.appendChild(msgElement);
  };

  // Cargar productos desde la API
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const products = await response.json();

      // ocultar mensaje "Cargando..."
      loadingMessage.style.display = 'none';

      if (products.length === 0) {
        showMessage('No hay productos disponibles en este momento.', 'info');
        return;
      }

      // crear una fila por cada producto
      products.forEach(product => {
        const productRow = createProductRow(product);
        tablaProductosBody.appendChild(productRow);
      });
    } catch (error) {
      loadingMessage.style.display = 'none';
      showMessage('No se pudieron cargar los productos. Por favor, intenta más tarde.', 'error');
      console.error(error);
    }
  };

  // ejecutar
  loadProducts();
});
