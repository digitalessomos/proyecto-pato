/**
 * Lógica Principal de la Tienda - Verdulería Tefy (Alpine.js)
 * Sincronización en Tiempo Real con Firebase Cloud Firestore (Modular SDK v10)
 * 
 * Utiliza `onSnapshot` sobre la colección "productos" para reflejar cambios de stock,
 * precios y nuevas ofertas al instante en la pantalla de los clientes sin recargar la página.
 */

import Alpine from "https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/module.esm.js";
import { setupCartStore } from "./cart.js";
import { 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType, 
  testConnection,
  collection, 
  onSnapshot, 
  getDocs, 
  doc 
} from "./firebase-config.js";
import { productsService } from "./productsService.js";

// Hacer Alpine disponible globalmente de forma inmediata
const alpineInstance = (typeof window !== "undefined" && window.Alpine) ? window.Alpine : Alpine;
if (typeof window !== "undefined") {
  window.Alpine = alpineInstance;
}

// 1. Inicializar el store reactivo del carrito de compras
setupCartStore(alpineInstance);

// 2. Registrar el componente reactivo principal de la tienda
alpineInstance.data("verduleriaApp", () => ({
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
        imagen: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        titulo: "Frutas y Verduras del Día",
        subtitulo: "De la huerta directo a tu mesa, con la calidad y frescura de siempre.",
        destacado: "Manzanas, Bananas y Cítricos Seleccionados",
        badge: "🍎 Directo del Mercado"
      },
      {
        id: 2,
        imagen: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=1200&q=80",
        titulo: "El Mejor Precio de Villa Luzuriaga",
        subtitulo: "Cuidamos el bolsillo de nuestros vecinos con ofertas diarias insuperables.",
        destacado: "Papas, Tomates y Verduras Esenciales",
        badge: "🥬 Precios Transparentes"
      },
      {
        id: 3,
        imagen: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80",
        titulo: "Tu Puesto Amigo en Guido Spano y Carrasco",
        subtitulo: "Atención cálida, pesaje justo a la vista y variedad completa para tu hogar.",
        destacado: "Mandarinas a $1.300/kg y Limones a $2.000/kg",
        badge: "📍 En el Corazón del Barrio"
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

        // Iniciar suscripción a productos (Cloud Firestore o Fallback Local)
        await this.initProductsSource();

      } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        this.isLoading = false;
      }
    },

    /**
     * Conecta con Cloud Firestore mediante `onSnapshot` en tiempo real,
     * o activa el modo de demostración local si aún no se configuraron credenciales.
     */
    async initProductsSource() {
      if (isFirebaseConfigured()) {
        console.log("🔥 [Firestore] Conectando a Cloud Firestore en tiempo real...");
        await testConnection();

        try {
          const colRef = collection(db, "productos");

          // Escuchador en tiempo real: onSnapshot
          this.unsubscribeSnapshot = onSnapshot(
            colRef,
            (snapshot) => {
              const items = [];
              snapshot.forEach((docSnap) => {
                items.push({
                  id: docSnap.id,
                  ...docSnap.data()
                });
              });

              console.log(`⚡ [Firestore onSnapshot] ${items.length} productos recibidos en vivo.`);
              
              if (items.length > 0) {
                this.products = items;
                this.isLiveFromFirestore = true;
                this.isLoading = false;
                this.lastUpdateTimestamp = Date.now();

                // Notificación toast de actualización en vivo si el cliente ya estaba navegando
                if (this.hasLoadedOnce && typeof window.Toastify === "function") {
                  window.Toastify({
                    text: "⚡ Precios y catálogo actualizados en vivo desde Firestore",
                    duration: 2500,
                    gravity: "bottom",
                    position: "left",
                    style: {
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      borderRadius: "14px",
                      boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4)",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#FFFFFF"
                    }
                  }).showToast();
                }

                this.hasLoadedOnce = true;
              } else {
                // Si la colección de Firestore está vacía, sembrar productos por defecto
                console.info("ℹ️ Colección Firestore vacía. Sembrando catálogo inicial...");
                productsService.seedFirestore().then((defaults) => {
                  this.products = defaults;
                  this.isLiveFromFirestore = true;
                  this.isLoading = false;
                  this.hasLoadedOnce = true;
                }).catch(() => {
                  this.fallbackToLocalStorage();
                });
              }
            },
            (error) => {
              handleFirestoreError(error, OperationType.LIST, "productos");
              console.warn("⚠️ Error en onSnapshot de Firestore, activando fallback local:", error);
              this.fallbackToLocalStorage();
            }
          );

          return;
        } catch (err) {
          console.error("Error al suscribirse a Firestore:", err);
          this.fallbackToLocalStorage();
        }
      } else {
        console.info("ℹ️ Modo Local: firebase-config.js aún contiene valores de ejemplo. Usando almacenamiento local.");
        this.fallbackToLocalStorage();
      }
    },

    /**
     * Modo de contingencia con almacenamiento local
     */
    async fallbackToLocalStorage() {
      this.isLiveFromFirestore = false;
      const localProducts = await productsService.getProducts();
      this.products = localProducts;
      this.isLoading = false;
      this.lastUpdateTimestamp = Date.now();

      // Escuchar eventos locales entre pestañas
      window.addEventListener("storage", async (event) => {
        const storageKey = productsService.STORAGE_KEY || "roli_verduleria_products_v1";
        if (event.key === storageKey || !event.key) {
          const fresh = await productsService.getProducts();
          this.products = fresh;
          this.lastUpdateTimestamp = Date.now();
        }
      });

      window.addEventListener("products-updated", (event) => {
        if (event.detail && Array.isArray(event.detail.products)) {
          this.products = event.detail.products;
          this.lastUpdateTimestamp = Date.now();
        }
      });
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
                        "Tefy";
      const message = `Hola ${storeName}! Vi en la web el producto "${product.nombre}" (${this.formatPrice(product.precio)} / ${product.unidad}) y quería consultar disponibilidad.`;
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
                        "Tefy";
      const message = customMessage || `Hola ${storeName}! Te escribo desde la página web para hacerte una consulta.`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
  }));

  // Iniciar Alpine de forma determinista una vez registrados stores y componentes
  if (typeof window !== "undefined" && !window._alpineStarted) {
    window._alpineStarted = true;
    alpineInstance.start();
  }
