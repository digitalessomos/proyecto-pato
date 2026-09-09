/**
 * Lógica Principal de la Aplicación - Pastelería Pato (Alpine.js)
 * Nervo y Laínez, Haedo, Buenos Aires
 * 
 * Orquesta la reactividad del catálogo dulce, el slider cinematográfico y los filtros.
 * Sincronizado automáticamente con localStorage y eventos en tiempo real.
 */

document.addEventListener("alpine:init", () => {
  const appFactory = () => ({
    // Estado del catálogo
    products: [],
    categories: [],
    store: {},
    activeCategory: "todos",
    searchQuery: "",
    isLoading: true,
    lastUpdateTimestamp: Date.now(),

    // Estado del Hero Slider Cinematográfico con Delicias de Pastelería
    currentSlide: 0,
    sliderTimer: null,
    slides: [
      {
        id: 1,
        imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
        titulo: "Tortas y Tartas Artesanales",
        subtitulo: "Rogel con merengue italiano, Chocotorta clásica, Lemon Pie y Cheesecakes con frutas frescas.",
        destacado: "Rogel, Chocotorta, Lemon Pie y Selva Negra",
        badge: "🎂 Repostería de Calidad"
      },
      {
        id: 2,
        imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
        titulo: "Medialunas Calentitas y Facturas",
        subtitulo: "Hojaldre 100% pura manteca, almíbar perfumado y el aroma inconfundible de nuestro obrador.",
        destacado: "Medialunas de Manteca, Grasa y Facturas Surtidas",
        badge: "🥐 Horneado del Día"
      },
      {
        id: 3,
        imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80",
        titulo: "Tu Pastelería en Nervo y Laínez",
        subtitulo: "Atención cálida y familiar en Haedo. Pedí online por WhatsApp y retirá sin esperas o pedí delivery.",
        destacado: "Alfajores de Maicena, Masas Finas y Shots Dulces",
        badge: "📍 Nervo y Laínez, Haedo"
      }
    ],

    // Inicialización del componente
    async init() {
      try {
        const service = window.productsService;
        if (!service) {
          throw new Error("productsService no se encuentra cargado.");
        }

        const [categoriesData, storeData] = await Promise.all([
          service.getCategories(),
          service.getStoreInfo()
        ]);

        this.categories = categoriesData;
        this.store = storeData;

        // Cargar delicias desde localStorage
        await this.loadProducts(false);
        this.isLoading = false;

        // Escuchador del evento 'storage' para sincronización inter-pestañas en tiempo real
        window.addEventListener("storage", async (event) => {
          const storageKey = service.STORAGE_KEY || "pasteleria_pato_products_v1";
          if (event.key === storageKey || !event.key) {
            console.log("⚡ [Pastelería Pato] Sincronización detectada desde panel admin vía storage event.");
            await this.loadProducts(true);
          }
        });

        // Escuchador de evento personalizado para cambios en la misma pestaña
        window.addEventListener("products-updated", async (event) => {
          console.log("⚡ [Pastelería Pato] Actualización de delicias recibida en la misma pestaña.");
          if (event.detail && Array.isArray(event.detail.products)) {
            this.products = event.detail.products;
            this.lastUpdateTimestamp = Date.now();
          } else {
            await this.loadProducts(true);
          }
        });

        this.startSlider();

      } catch (error) {
        console.error("Error al cargar los datos de la pastelería:", error);
        this.isLoading = false;
      }
    },

    // Carga de productos desde el servicio / localStorage
    async loadProducts(showToast = false) {
      try {
        if (!window.productsService) return;
        const freshProducts = await window.productsService.getProducts();
        this.products = freshProducts;
        this.lastUpdateTimestamp = Date.now();

        if (showToast && window.Toastify) {
          Toastify({
            text: "⚡ Carta dulce y precios actualizados en vivo",
            duration: 2500,
            gravity: "bottom",
            position: "left",
            style: {
              background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
              borderRadius: "14px",
              boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.4)",
              fontSize: "12px",
              fontWeight: "600",
              color: "#FFFFFF"
            }
          }).showToast();
        }
      } catch (e) {
        console.error("Error al refrescar delicias:", e);
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
      this.startSlider(); // Reinicia el timer al interactuar
    },

    // Métodos de Filtrado
    setCategory(catId) {
      this.activeCategory = catId;
    },

    clearFilters() {
      this.activeCategory = "todos";
      this.searchQuery = "";
    },

    // Propiedad computada: Delicias disponibles filtradas por categoría y búsqueda
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
      const message = `Hola ${storeName}! Vi en la web de Pastelería Pato el producto "${product.nombre}" (${this.formatPrice(product.precio)} / ${product.unidad}) y quería consultar disponibilidad / encargar.`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    },

    // Generador de enlace general a WhatsApp (para botones de cabecera y contacto)
    getWhatsAppGeneralLink(customMessage) {
      const phone = (window.STORE_CONFIG && window.STORE_CONFIG.telefonoWhatsApp) || 
                    this.store.telefonoWhatsApp || 
                    "5491159665917";
      const storeName = (window.STORE_CONFIG && (window.STORE_CONFIG.dueno || window.STORE_CONFIG.nombre)) || 
                        this.store.dueno || 
                        this.store.nombre || 
                        "Pato";
      const message = customMessage || `Hola ${storeName}! Te escribo desde la tienda online de Pastelería Pato (Haedo) para hacerte una consulta.`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
  });

  Alpine.data("pasteleriaApp", appFactory);
  Alpine.data("verduleriaApp", appFactory); // Retrocompatibilidad para evitar roturas
});
