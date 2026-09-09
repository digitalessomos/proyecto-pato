/**
 * Servicio de Productos - Verdulería Roli
 * Integración con Firebase Cloud Firestore (Modular SDK v10) & Fallback Local
 * 
 * Gestiona la persistencia de productos en la colección "productos" de Firestore
 * y provee sincronización y operaciones CRUD desacopladas.
 */

import { 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy
} from "./firebase-config.js";
import { INITIAL_PRODUCTS, CATEGORIES } from "../data/products.js";
import { STORE_CONFIG } from "../data/config.js";

const STORAGE_KEY = "roli_verduleria_products_v1";

/**
 * Obtiene la lista base por defecto desde data/products.js
 */
function getDefaultProducts() {
  if (typeof window !== "undefined" && Array.isArray(window.productsData) && window.productsData.length > 0) {
    return JSON.parse(JSON.stringify(window.productsData));
  }
  if (Array.isArray(INITIAL_PRODUCTS) && INITIAL_PRODUCTS.length > 0) {
    return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  }
  return [];
}

export const productsService = {
  STORAGE_KEY,

  /**
   * Obtiene los productos desde Cloud Firestore (o localStorage si no está configurado)
   * @returns {Promise<Array>} Lista de productos
   */
  async getProducts() {
    // 1. Si Firebase está configurado, consultar Cloud Firestore
    if (isFirebaseConfigured()) {
      try {
        const colRef = collection(db, "productos");
        const snapshot = await getDocs(colRef);

        if (!snapshot.empty) {
          const firestoreProducts = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          return firestoreProducts;
        } else {
          console.info("ℹ️ La colección 'productos' en Firestore está vacía. Sembrando productos iniciales...");
          // Si está vacía la primera vez, sembrar los productos por defecto automáticamente
          const defaults = getDefaultProducts();
          if (defaults.length > 0) {
            await this.seedFirestore(defaults);
            return defaults;
          }
          return [];
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "productos");
        console.warn("⚠️ Error al consultar Firestore. Utilizando almacenamiento local como respaldo:", error);
      }
    }

    // 2. Fallback a LocalStorage para desarrollo / vista previa
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }

        const defaults = getDefaultProducts();
        if (defaults.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          return defaults;
        }
      }
    } catch (err) {
      console.warn("[productsService] Error en fallback de localStorage:", err);
    }

    return getDefaultProducts();
  },

  /**
   * Agrega un nuevo producto a Cloud Firestore
   * @param {Object} product
   */
  async addProduct(product) {
    // Generar un ID legible y único
    let baseId = (product.nombre || "producto")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseId) baseId = "prod-" + Date.now();
    const uniqueId = `${baseId}-${Date.now().toString().slice(-4)}`;

    const newProduct = {
      id: uniqueId,
      nombre: product.nombre.trim(),
      categoria: product.categoria || "verduras",
      precio: Math.max(0, Math.round(Number(product.precio) || 0)),
      unidad: product.unidad || "kg",
      imagen: product.imagen || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
      descripcion: (product.descripcion || "").trim() || "Fresco y seleccionado del puesto de Tefy.",
      destacado: Boolean(product.destacado),
      etiqueta: (product.etiqueta || "Del Día").trim(),
      disponible: product.disponible !== false && product.disponible !== "agotado",
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, "productos", uniqueId);
        await setDoc(docRef, newProduct);
        console.log(`✅ [Firestore] Producto "${newProduct.nombre}" agregado con ID ${uniqueId}`);
        return newProduct;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `productos/${uniqueId}`);
        throw error;
      }
    }

    // Fallback Local
    const all = await this.getProducts();
    all.unshift(newProduct);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: all } }));
    }
    return newProduct;
  },

  /**
   * Actualiza campos de un producto existente por su ID
   * @param {string} id
   * @param {Object} updates
   */
  async updateProduct(id, updates) {
    const cleanUpdates = { ...updates, updatedAt: new Date().toISOString() };

    if (cleanUpdates.precio !== undefined) {
      cleanUpdates.precio = Math.max(0, Math.round(Number(cleanUpdates.precio) || 0));
    }
    if (cleanUpdates.disponible !== undefined) {
      cleanUpdates.disponible = cleanUpdates.disponible !== false && cleanUpdates.disponible !== "agotado";
    }

    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, "productos", id);
        await updateDoc(docRef, cleanUpdates);
        console.log(`✅ [Firestore] Producto ${id} actualizado con éxito.`);
        return { id, ...cleanUpdates };
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `productos/${id}`);
        throw error;
      }
    }

    // Fallback Local
    const all = await this.getProducts();
    const index = all.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Producto con id "${id}" no encontrado.`);
    }

    const updated = { ...all[index], ...cleanUpdates };
    all[index] = updated;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: all } }));
    }
    return updated;
  },

  /**
   * Elimina un producto por ID
   * @param {string} id
   */
  async deleteProduct(id) {
    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, "productos", id);
        await deleteDoc(docRef);
        console.log(`✅ [Firestore] Producto ${id} eliminado con éxito.`);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `productos/${id}`);
        throw error;
      }
    }

    // Fallback Local
    const all = await this.getProducts();
    const filtered = all.filter(p => p.id !== id);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: filtered } }));
    }
    return true;
  },

  /**
   * Siembra la lista por defecto en Cloud Firestore usando batch writes
   */
  async seedFirestore(items = null) {
    const list = items || getDefaultProducts();
    if (!isFirebaseConfigured()) {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      return list;
    }

    try {
      const batch = writeBatch(db);
      for (const prod of list) {
        const docRef = doc(db, "productos", prod.id);
        batch.set(docRef, {
          ...prod,
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log(`✅ [Firestore] ${list.length} productos sembrados correctamente.`);
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "productos");
      throw error;
    }
  },

  /**
   * Restablece el catálogo a los datos originales por defecto
   */
  async resetToDefaults() {
    const defaults = getDefaultProducts();
    if (isFirebaseConfigured()) {
      await this.seedFirestore(defaults);
      return defaults;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: defaults } }));
    }
    return defaults;
  },

  /**
   * Obtiene las categorías configuradas
   */
  async getCategories() {
    if (typeof window !== "undefined" && Array.isArray(window.categoriesData) && window.categoriesData.length > 0) {
      return window.categoriesData;
    }
    if (Array.isArray(CATEGORIES) && CATEGORIES.length > 0) {
      return CATEGORIES;
    }
    return [
      { id: "todos", nombre: "Todo el Puesto", icono: "🧺" },
      { id: "verduras", nombre: "Verduras y Huerta", icono: "🥬" },
      { id: "frutas", nombre: "Frutas Dulces", icono: "🍎" },
      { id: "citricos", nombre: "Cítricos y Jugo", icono: "🍊" }
    ];
  },

  /**
   * Obtiene la información institucional del puesto
   */
  async getStoreInfo() {
    const info = (typeof window !== "undefined" && (window.STORE_CONFIG || window.storeInfo)) 
      ? (window.STORE_CONFIG || window.storeInfo) 
      : (STORE_CONFIG || {
          nombre: "Verdulería Tefy",
          dueno: "Tefy",
          telefonoWhatsApp: "5491159665917",
          direccion: "Guido Spano y Carrasco",
          localidad: "Villa Luzuriaga, Buenos Aires"
        });
    return Promise.resolve(info);
  }
};

// Exponer en window para compatibilidad global
if (typeof window !== "undefined") {
  window.productsService = productsService;
}
