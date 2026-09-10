/**
 * 🎂 Pastelería Pato | Plataforma E-Commerce Reactiva (Haedo, Buenos Aires)
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * Todos los derechos reservados / All Rights Reserved.
 * Queda prohibida la reproducción, distribución o ingeniería inversa total o parcial sin autorización por escrito.
 */

// Firma de autoría y marca de agua disuasoria en consola de desarrollador
if (typeof console !== "undefined" && typeof console.log === "function") {
  console.log(
    "%c🎂 Pastelería Pato %c\n© 2026 GastroWeb Studio 360 & Pastelería Pato. Todos los derechos reservados.\nSoftware propietario. Prohibida su copia, clonación o distribución no autorizada.",
    "background: #4C0519; color: #FB7185; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 6px;",
    "color: #9CA3AF; font-size: 11px; font-weight: 500;"
  );
}

import Alpine from "https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/module.esm.js";
import { setupCartStore } from "./cart.js";
import { productsService } from "./productsService.js";

// Hacer Alpine disponible globalmente de forma inmediata
const alpineInstance = (typeof window !== "undefined" && window.Alpine) ? window.Alpine : Alpine;
if (typeof window !== "undefined") {
  window.Alpine = alpineInstance;
}

// 1. Inicializar el store reactivo del carrito de compras
setupCartStore(alpineInstance);

// 2. Registrar el componente reactivo principal de la pastelería
const pasteleriaAppFactory = () => ({
  // Estado del catálogo
  products: [],
  categories: [],
  store: {},
  activeCategory: "todos",
  searchQuery: "",
  isLoading: true,
  isLiveFromFirestore: false,
  hasLoadedOnce: false,
  unsubscribeSnapshot: null,
  lastUpdateTimestamp: Date.now(),

  // Estado del Hero Slider Cinematográfico
  currentSlide: 0,
  sliderTimer: null,
  slides: [
    {
      id: 1,
      imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
      titulo: "Pastelería Artesanal con Amor",
      subtitulo: "Tortas caseras, tartas dulces y bocados para celebrar cada momento especial.",
      destacado: "Rogel Clásico, Chocotorta y Marquise con Frutos Rojos",
      badge: "🎂 Horneado del Día"
    },
    {
      id: 2,
      imagen: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=80",
      titulo: "El Auténtico Sabor Casero en Haedo",
      subtitulo: "Ingredientes de primera calidad, recetas familiares y dulzura sin conservantes.",
      destacado: "Lemon Pie, Tarta Havannet y Ricota Tradicional",
      badge: "✨ Calidad Artesanal"
    },
    {
      id: 3,
      imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
      titulo: "Tu Pastelería en Nervo y Lainez",
      subtitulo: "Hacé tu pedido directo por WhatsApp con retiro en el local o delivery coordinado.",
      destacado: "Alfajores de Maicena, Medialunas y Budines Húmedos",
      badge: "📍 Nervo y Lainez, Haedo"
    }
  ],

  // Inicialización del componente
  async init() {
    try {
      const [categoriesData, storeData] = await Promise.all([
        productsService.getCategories(),
        productsService.getStoreInfo()
      ]);

      this.categories = categoriesData;
      this.store = storeData;

      // Iniciar suscripción Observer a productos
      this.initProductsSource();

      // Arrancar rotación automática del Hero Slider
      this.startSlider();

    } catch (error) {
      console.error("Error al inicializar la aplicación de Pastelería Pato:", error);
      this.isLoading = false;
    }
  },

  /**
   * Conecta con la fuente de productos mediante el Patrón Observer en productsService.
   * Totalmente desacoplado de la tecnología de base de datos subyacente.
   */
  initProductsSource() {
    this.unsubscribeSnapshot = productsService.subscribeToProducts({
      onData: (items, { isLiveFromFirestore }) => {
        this.products = items;
        this.isLiveFromFirestore = Boolean(isLiveFromFirestore);
        this.isLoading = false;
        this.lastUpdateTimestamp = Date.now();

        // Notificación toast de actualización en vivo si el cliente ya estaba navegando
        if (this.hasLoadedOnce && this.isLiveFromFirestore && typeof window.Toastify === "function") {
          window.Toastify({
            text: "⚡ Precios y delicias actualizadas en vivo desde Firestore",
            duration: 2500,
            gravity: "bottom",
            position: "left",
            style: {
              background: "linear-gradient(135deg, #BE123C 0%, #9F1239 100%)",
              borderRadius: "14px",
              boxShadow: "0 10px 25px -5px rgba(190, 18, 60, 0.4)",
              fontSize: "12px",
              fontWeight: "600",
              color: "#FFFFFF"
            }
          }).showToast();
        }

        this.hasLoadedOnce = true;
      },
      onError: (error) => {
        console.warn("⚠️ [app.js] Error en suscripción de catálogo, operando en contingencia:", error);
      }
    });
  },

  // Liberar recursos y listeners al desmontar
  destroy() {
    if (typeof this.unsubscribeSnapshot === "function") {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
      this.sliderTimer = null;
    }
  },

  // Métodos del Slider
  startSlider() {
    if (this.sliderTimer) clearInterval(this.sliderTimer);
    this.sliderTimer = setInterval(() => {
      this.nextSlide();
    }, 5500);
  },

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  },

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  },

  goToSlide(index) {
    this.currentSlide = index;
    this.startSlider();
  },

  // Métodos de Filtrado
  setCategory(catId) {
    this.activeCategory = catId;
  },

  clearFilters() {
    this.activeCategory = "todos";
    this.searchQuery = "";
  },

  // Propiedad computada: Productos disponibles filtrados por categoría y búsqueda
  get filteredProducts() {
    return this.products.filter((product) => {
      const isAvailable = product.disponible !== false && product.disponible !== "agotado";
      if (!isAvailable) return false;

      const matchesCategory = 
        this.activeCategory === "todos" || product.categoria === this.activeCategory;

      const query = (this.searchQuery || "").toLowerCase().trim();
      const matchesSearch = 
        query === "" ||
        (product.nombre && product.nombre.toLowerCase().includes(query)) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(query)) ||
        (product.categoria && product.categoria.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  },

  // Total de productos disponibles actualmente
  get totalAvailableCount() {
    return this.products.filter(p => p.disponible !== false && p.disponible !== "agotado").length;
  },

  // Conteo de productos disponibles por categoría
  getCategoryCount(catId) {
    const available = this.products.filter(p => p.disponible !== false && p.disponible !== "agotado");
    if (catId === "todos") return available.length;
    return available.filter((p) => p.categoria === catId).length;
  },

  // Formateador de moneda argentina
  formatPrice(price) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(Number(price) || 0);
  },

  // Scroll suave hacia una sección
  scrollTo(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  // Generador de enlace directo a WhatsApp para consultas de productos
  getWhatsAppProductLink(product) {
    const phone = (window.STORE_CONFIG && window.STORE_CONFIG.telefonoWhatsApp) || 
                  this.store.telefonoWhatsApp || 
                  "5491159665917";
    const storeName = (window.STORE_CONFIG && (window.STORE_CONFIG.dueno || window.STORE_CONFIG.nombre)) || 
                      this.store.dueno || 
                      this.store.nombre || 
                      "Pato";
    const message = `Hola ${storeName}! Vi en la web "${product.nombre}" (${this.formatPrice(product.precio)} / ${product.unidad}) de Pastelería Pato y quería consultar disponibilidad para hacer un pedido.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  // Generador de enlace general a WhatsApp
  getWhatsAppGeneralLink(customMessage) {
    const phone = (window.STORE_CONFIG && window.STORE_CONFIG.telefonoWhatsApp) || 
                  this.store.telefonoWhatsApp || 
                  "5491159665917";
    const storeName = (window.STORE_CONFIG && (window.STORE_CONFIG.dueno || window.STORE_CONFIG.nombre)) || 
                      this.store.dueno || 
                      this.store.nombre || 
                      "Pato";
    const message = customMessage || `Hola ${storeName}! Te escribo desde la tienda online de Pastelería Pato en Haedo para hacerte una consulta.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
};

// Registro oficial como pasteleriaApp y alias retrocompatible
alpineInstance.data("pasteleriaApp", pasteleriaAppFactory);
alpineInstance.data("verduleriaApp", pasteleriaAppFactory);

// Iniciar Alpine de forma determinista una vez registrados stores y componentes
if (typeof window !== "undefined" && !window._alpineStarted) {
  window._alpineStarted = true;
  alpineInstance.start();
}
