/**
 * Servicio de Productos (Capa de Abstracción / Adaptador con LocalStorage)
 * 
 * Gestiona la persistencia de productos en localStorage ('pasteleria_pato_products_v1')
 * con carga automática de productos por defecto la primera vez, y métodos CRUD completos.
 * 
 * Desacoplado y preparado para sincronización instantánea y futuras migraciones.
 */

(function (root, factory) {
  const service = factory();
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = service;
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    root.productsService = service;
  }
})(typeof self !== "undefined" ? self : this, function () {

  const STORAGE_KEY = "pasteleria_pato_products_v1";

  /**
   * Obtiene la lista base por defecto desde data/products.js
   */
  function getDefaultProducts() {
    if (typeof window !== "undefined" && Array.isArray(window.productsData) && window.productsData.length > 0) {
      return JSON.parse(JSON.stringify(window.productsData));
    }
    return [];
  }

  const productsService = {
    STORAGE_KEY,

    /**
     * Obtiene los productos desde localStorage.
     * Si está vacío, inicializa localStorage con los productos por defecto.
     * @returns {Promise<Array>} Lista de productos
     */
    async getProducts() {
      try {
        if (typeof localStorage !== "undefined") {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          }

          // Si no hay productos en localStorage, sembrar la lista por defecto
          const defaults = getDefaultProducts();
          if (defaults.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
            return defaults;
          }
        }
      } catch (err) {
        console.warn("[productsService] Error al leer de localStorage:", err);
      }

      // Fallback a memoria
      return getDefaultProducts();
    },

    /**
     * Guarda la lista completa de productos en localStorage y notifica en la misma ventana
     * @param {Array} productsList
     */
    async saveProducts(productsList) {
      if (!Array.isArray(productsList)) {
        throw new Error("El listado de productos debe ser un array válido.");
      }

      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(productsList));
        }

        // Disparar evento personalizado para sincronización en la misma pestaña
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("products-updated", {
            detail: { products: productsList }
          }));
        }

        return productsList;
      } catch (err) {
        console.error("[productsService] Error al guardar en localStorage:", err);
        throw err;
      }
    },

    /**
     * Agrega un nuevo producto a localStorage
     * @param {Object} product
     */
    async addProduct(product) {
      const all = await this.getProducts();

      // Generar slug ID limpio y único si no viene provisto
      let baseId = (product.nombre || "delicia")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // sin tildes
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!baseId) baseId = "delicia-" + Date.now();
      let uniqueId = baseId;
      let counter = 1;
      while (all.some(p => p.id === uniqueId)) {
        uniqueId = `${baseId}-${counter++}`;
      }

      const newProduct = {
        id: uniqueId,
        nombre: product.nombre.trim(),
        categoria: product.categoria || "tortas",
        precio: Math.max(0, Math.round(Number(product.precio) || 0)),
        unidad: product.unidad || "unidad",
        imagen: product.imagen || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
        descripcion: (product.descripcion || "").trim() || "Elaborada artesanalmente en el obrador de Pastelería Pato.",
        destacado: Boolean(product.destacado),
        etiqueta: (product.etiqueta || "Del Obrador").trim(),
        disponible: product.disponible !== false && product.disponible !== "agotado"
      };

      all.unshift(newProduct); // Agregar al inicio para visibilidad inmediata
      await this.saveProducts(all);
      return newProduct;
    },

    /**
     * Actualiza campos de un producto existente por su ID
     * @param {string} id
     * @param {Object} updates
     */
    async updateProduct(id, updates) {
      const all = await this.getProducts();
      const index = all.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Producto con id "${id}" no encontrado.`);
      }

      const current = all[index];
      const updated = {
        ...current,
        ...updates
      };

      if (updates.precio !== undefined) {
        updated.precio = Math.max(0, Math.round(Number(updates.precio) || 0));
      }
      if (updates.disponible !== undefined) {
        updated.disponible = updates.disponible !== false && updates.disponible !== "agotado";
      }

      all[index] = updated;
      await this.saveProducts(all);
      return updated;
    },

    /**
     * Elimina un producto por ID
     * @param {string} id
     */
    async deleteProduct(id) {
      const all = await this.getProducts();
      const filtered = all.filter(p => p.id !== id);
      if (filtered.length === all.length) {
        throw new Error(`No se encontró el producto a eliminar (${id}).`);
      }
      await this.saveProducts(filtered);
      return true;
    },

    /**
     * Restablece el catálogo a los datos originales por defecto
     */
    async resetToDefaults() {
      const defaults = getDefaultProducts();
      await this.saveProducts(defaults);
      return defaults;
    },

    /**
     * Obtiene las categorías configuradas
     */
    async getCategories() {
      const cats = (typeof window !== "undefined" && window.categoriesData) ? window.categoriesData : [
        { id: "todos", nombre: "Todas las Delicias", icono: "🍰" },
        { id: "tortas", nombre: "Tortas & Tartas", icono: "🎂" },
        { id: "facturas", nombre: "Facturas & Medialunas", icono: "🥐" },
        { id: "alfajores", nombre: "Alfajores & Masas", icono: "🍪" },
        { id: "postres", nombre: "Postres & Budines", icono: "🧁" }
      ];
      return Promise.resolve(cats);
    },

    /**
     * Obtiene la información institucional del comercio
     */
    async getStoreInfo() {
      const info = (typeof window !== "undefined" && (window.STORE_CONFIG || window.storeInfo)) 
        ? (window.STORE_CONFIG || window.storeInfo) 
        : {
            nombre: "Pastelería Pato",
            dueno: "Pato",
            telefonoWhatsApp: "5491159665917",
            direccion: "Nervo y Laínez",
            localidad: "Haedo, Buenos Aires"
          };
      return Promise.resolve(info);
    },

    /**
     * Busca productos por texto en tiempo real
     */
    async searchProducts(query) {
      const term = (query || "").toLowerCase().trim();
      const all = await this.getProducts();
      if (!term) return all;

      return all.filter(p => 
        (p.nombre && p.nombre.toLowerCase().includes(term)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
        (p.categoria && p.categoria.toLowerCase().includes(term))
      );
    }
  };

  return productsService;
});
