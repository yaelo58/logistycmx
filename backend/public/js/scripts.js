// backend/public/js/scripts.js

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navigation");
  const menuLinks = document.querySelectorAll(".nav-link");
  const btnLinks = document.querySelectorAll("a.btn[href^='#']"); // Selecciona enlaces con clase .btn que empiezan con #
  const header = document.querySelector('header');
  const headerHeight = header.offsetHeight;
  const sections = document.querySelectorAll("section");

  // Función para alternar el menú móvil
  const toggleMenu = () => {
    navigation.classList.toggle("active");
  };

  menuToggle.addEventListener("click", toggleMenu);

  // Función para resaltar el enlace activo
  const highlightNav = (entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const navLink = document.querySelector(
        `.nav-link[href="#${id}"], .nav-link[href="index.html#${id}"]`
      );

      if (entry.isIntersecting) {
        menuLinks.forEach(link => link.classList.remove("active"));
        if (navLink) navLink.classList.add("active");
      }
    });
  };

  const observerOptions = {
    root: null,
    rootMargin: `-${headerHeight}px 0px 0px 0px`,
    threshold: 0.3
  };

  const observer = new IntersectionObserver(highlightNav, observerOptions);
  sections.forEach(section => observer.observe(section));

  // Función para manejar el click en enlaces de navegación
  const handleNavLinkClick = (event, link) => {
    const href = link.getAttribute("href");

    if (href.startsWith("#")) {
      event.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - headerHeight;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
      }
    }

    if (navigation.classList.contains("active")) {
      toggleMenu();
    }
  };

  // Añadir eventos a enlaces de navegación
  menuLinks.forEach(link => {
    link.addEventListener("click", (event) => handleNavLinkClick(event, link));
  });

  // Añadir eventos a botones con clase .btn que son enlaces ancla
  btnLinks.forEach(link => {
    link.addEventListener("click", (event) => handleNavLinkClick(event, link));
  });

  // Cerrar menú al presionar 'Esc'
  const cerrarMenuPorEsc = (e) => {
    if (e.key === 'Escape' && navigation.classList.contains('active')) {
      toggleMenu();
    }
  };
  
  document.addEventListener('keydown', cerrarMenuPorEsc);
});
