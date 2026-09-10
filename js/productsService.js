/**
 * 🎂 Servicio de Productos - Pastelería Pato (Haedo, Buenos Aires)
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * Todos los derechos reservados / All Rights Reserved.
 * 
 * Integración con Firebase Cloud Firestore (Modular SDK v10), Firebase Storage & Fallback Local
 * Gestiona la persistencia de delicias en la colección "productos" de Firestore,
 * optimización de imágenes en la nube y suscripción reactiva en tiempo real mediante Patrón Observer.
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
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  storage,
  storageRef,
  uploadString,
  getDownloadURL
} from "./firebase-config.js";
import { INITIAL_PRODUCTS, CATEGORIES } from "../data/products.js";
import { STORE_CONFIG } from "../data/config.js";

const STORAGE_KEY = "pato_pasteleria_products_v1";

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
   * Suscribe un observador a las actualizaciones en tiempo real del catálogo de productos.
   * Encapsula Cloud Firestore (`onSnapshot`) si está configurado y online, o activa el fallback
   * reactivo a `localStorage` (escuchando eventos nativos entre pestañas y CustomEvents en la misma pestaña).
   * 
   * Cumple con el Patrón Observer y desacopla la vista de la tecnología de base de datos.
   * 
   * @param {Object|Function} listener - Callback function(products, meta) o { onData: Function, onError: Function }
   * @returns {Function} Función unsubscribe() para limpiar todos los listeners activos.
   */
  subscribeToProducts(listener) {
    const onData = typeof listener === "function" ? listener : listener?.onData;
    const onError = typeof listener === "object" ? listener?.onError : null;

    let isUnsubscribed = false;
    let unsubscribeFirestore = null;
    let storageListener = null;
    let customEventListener = null;

    const notify = (items, meta = {}) => {
      if (!isUnsubscribed && typeof onData === "function") {
        onData(items, meta);
      }
    };

    const activateLocalFallback = async () => {
      try {
        const localItems = await this.getProducts();
        notify(localItems, { isLiveFromFirestore: false });

        if (typeof window !== "undefined") {
          storageListener = async (event) => {
            if (event.key === STORAGE_KEY || !event.key) {
              const fresh = await this.getProducts();
              notify(fresh, { isLiveFromFirestore: false });
            }
          };
          window.addEventListener("storage", storageListener);

          customEventListener = (event) => {
            if (event.detail && Array.isArray(event.detail.products)) {
              notify(event.detail.products, { isLiveFromFirestore: false });
            }
          };
          window.addEventListener("products-updated", customEventListener);
        }
      } catch (err) {
        if (typeof onError === "function") onError(err);
      }
    };

    if (isFirebaseConfigured()) {
      try {
        const colRef = collection(db, "productos");
        unsubscribeFirestore = onSnapshot(
          colRef,
          async (snapshot) => {
            if (isUnsubscribed) return;

            const items = [];
            snapshot.forEach((docSnap) => {
              items.push({
                id: docSnap.id,
                ...docSnap.data()
              });
            });

            if (items.length > 0) {
              notify(items, { isLiveFromFirestore: true });
            } else {
              console.info("ℹ️ [productsService] Colección Firestore vacía. Sembrando catálogo inicial de pastelería...");
              try {
                const defaults = await this.seedFirestore();
                notify(defaults, { isLiveFromFirestore: true, isInitialSeed: true });
              } catch (seedErr) {
                console.warn("⚠️ [productsService] Error sembrando Firestore, activando fallback local:", seedErr);
                activateLocalFallback();
              }
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, "productos");
            console.warn("⚠️ [productsService] Error en onSnapshot de Firestore, activando fallback local:", error);
            if (typeof onError === "function") onError(error);
            activateLocalFallback();
          }
        );
      } catch (err) {
        console.error("⚠️ [productsService] Error al conectar suscripción de Firestore:", err);
        if (typeof onError === "function") onError(err);
        activateLocalFallback();
      }
    } else {
      activateLocalFallback();
    }

    return () => {
      isUnsubscribed = true;
      if (typeof unsubscribeFirestore === "function") {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }
      if (storageListener && typeof window !== "undefined") {
        window.removeEventListener("storage", storageListener);
        storageListener = null;
      }
      if (customEventListener && typeof window !== "undefined") {
        window.removeEventListener("products-updated", customEventListener);
        customEventListener = null;
      }
    };
  },

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
          console.info("ℹ️ La colección 'productos' en Firestore está vacía. Sembrando delicias iniciales...");
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
   * En el Plan Gratuito (Spark), retorna null para persistir directamente la imagen
   * comprimida por canvas en Firestore, garantizando costo $0 y evitando errores de CORS/Storage.
   * 
   * @param {string} dataUrl Cadena dataUrl de la imagen
   * @param {string} productId ID del producto asociado
   * @returns {Promise<string|null>}
   */
  async uploadProductImage(dataUrl, productId) {
    // Almacenamiento directo en Firestore (100% Gratuito y sin demoras de red)
    return null;
  },

  /**
   * Agrega un nuevo producto a Cloud Firestore y/o LocalStorage
   * @param {Object} product
   */
  async addProduct(product) {
    // Generar un ID legible y único
    let baseId = (product.nombre || "delicia")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseId) baseId = "delicia-" + Date.now();
    const uniqueId = `${baseId}-${Date.now().toString().slice(-4)}`;

    let finalImage = product.imagen || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80";

    // Si la imagen es Base64, intentar subir a Firebase Storage para persistir solo la URL corta
    if (finalImage && typeof finalImage === "string" && finalImage.startsWith("data:image/")) {
      const storageUrl = await this.uploadProductImage(finalImage, uniqueId);
      if (storageUrl) {
        finalImage = storageUrl;
      }
    }

    const newProduct = {
      id: uniqueId,
      nombre: product.nombre.trim(),
      categoria: product.categoria || "tortas",
      precio: Math.max(0, Math.round(Number(product.precio) || 0)),
      unidad: product.unidad || "unidad",
      imagen: finalImage,
      descripcion: (product.descripcion || "").trim() || "Elaboración artesanal fresca en Pastelería Pato.",
      destacado: Boolean(product.destacado),
      etiqueta: (product.etiqueta || "Especialidad").trim(),
      disponible: product.disponible !== false && product.disponible !== "agotado",
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      try {
        const docRef = doc(db, "productos", uniqueId);
        await setDoc(docRef, newProduct);
        console.log(`✅ [Firestore] Delicia "${newProduct.nombre}" agregada con ID ${uniqueId}`);
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

    // Si se envía una imagen Base64, intentar subir a Storage y persistir solo la URL
    if (cleanUpdates.imagen && typeof cleanUpdates.imagen === "string" && cleanUpdates.imagen.startsWith("data:image/")) {
      const storageUrl = await this.uploadProductImage(cleanUpdates.imagen, id);
      if (storageUrl) {
        cleanUpdates.imagen = storageUrl;
      }
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
      { id: "todos", nombre: "Todo el Menú", icono: "🧁" },
      { id: "tortas", nombre: "Tortas y Cakes", icono: "🎂" },
      { id: "tartas", nombre: "Tartas Dulces", icono: "🥧" },
      { id: "alfajores", nombre: "Alfajores y Masas", icono: "🍪" },
      { id: "budines", nombre: "Budines y Meriendas", icono: "🥐" }
    ];
  },

  /**
   * Obtiene la información institucional de la pastelería
   */
  async getStoreInfo() {
    const info = (typeof window !== "undefined" && (window.STORE_CONFIG || window.storeInfo)) 
      ? (window.STORE_CONFIG || window.storeInfo) 
      : (STORE_CONFIG || {
          nombre: "Pastelería Pato",
          dueno: "Pato",
          telefonoWhatsApp: "5491159665917",
          direccion: "Nervo y Lainez",
          localidad: "Haedo, Buenos Aires"
        });
    return Promise.resolve(info);
  }
};

// Exponer en window para compatibilidad global
if (typeof window !== "undefined") {
  window.productsService = productsService;
}
