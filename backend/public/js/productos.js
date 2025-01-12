document.addEventListener("DOMContentLoaded", () => {
    const productosContainer = document.getElementById('productos-container');
    const loadingMessage = document.getElementById('loading-message');

    // Crear elemento de producto
    const crearProductoElemento = ({ _id, nombre, descripcion, precio, imagen }) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto-item');

        productoDiv.innerHTML = `
            <img src="${imagen}" alt="${nombre}">
            <h3>${nombre}</h3>
            <p>${descripcion}</p>
            <p><strong>Precio:</strong> $${precio.toFixed(2)}</p>
            <a href="detalle-producto.html?id=${_id}" class="btn">Ver Más</a>
        `;

        return productoDiv;
    };

    // Mostrar mensaje
    const mostrarMensaje = (mensaje, tipo = 'info') => {
        const mensajeElemento = document.createElement('p');
        mensajeElemento.textContent = mensaje;
        mensajeElemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-info';
        productosContainer.appendChild(mensajeElemento);
    };

    // Cargar productos desde la API
    const cargarProductos = async () => {
        try {
            const respuesta = await fetch('/api/productos');
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
            }
            const productos = await respuesta.json();

            loadingMessage.style.display = 'none';

            if (productos.length === 0) {
                mostrarMensaje('No hay productos disponibles en este momento.', 'info');
                return;
            }

            productos.forEach(producto => {
                const productoElemento = crearProductoElemento(producto);
                productosContainer.appendChild(productoElemento);
            });
        } catch (error) {
            loadingMessage.style.display = 'none';
            mostrarMensaje('No se pudieron cargar los productos. Por favor, intenta más tarde.', 'error');
            console.error(error);
        }
    };

    cargarProductos();
});
