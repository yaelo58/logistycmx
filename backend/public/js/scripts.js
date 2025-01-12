document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".navigation");
    const menuLinks = document.querySelectorAll(".nav-link");
    const header = document.querySelector('header');
    const headerHeight = header.offsetHeight;
    const sections = document.querySelectorAll("section");

    // Función para alternar el menú móvil
    const toggleMenu = () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", !isExpanded);
        navigation.classList.toggle("active");
    };

    // Evento para el botón de menú
    menuToggle.addEventListener("click", toggleMenu);

    // Función para resaltar el enlace activo
    const highlightNav = (entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"], .nav-link[href="index.html#${id}"]`);

            if (entry.isIntersecting) {
                menuLinks.forEach(link => link.classList.remove("active"));
                if (navLink) {
                    navLink.classList.add("active");
                }
            }
        });
    };

    // Configuración del IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: 0.3
    };

    const observer = new IntersectionObserver(highlightNav, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Cerrar el menú al hacer clic en un enlace
    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navigation.classList.contains("active")) {
                toggleMenu();
            }
        });
    });

    // Cerrar el menú al presionar la tecla 'Esc'
    const handleEscape = (e) => {
        if (e.key === 'Escape' && navigation.classList.contains('active')) {
            toggleMenu();
        }
    };

    document.addEventListener('keydown', handleEscape);
});
