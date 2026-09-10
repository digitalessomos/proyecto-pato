/**
 * 🎂 Panel de Administración Exclusivo - Pastelería Pato
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * Todos los derechos reservados / All Rights Reserved.
 * Queda prohibida la reproducción, distribución o ingeniería inversa total o parcial sin autorización por escrito.
 */

// Firma de autoría y marca de agua en consola DevTools
if (typeof console !== "undefined" && typeof console.log === "function") {
  console.log(
    "%c🔐 Pastelería Pato | Panel de Control %c\n© 2026 GastroWeb Studio 360 & Pastelería Pato. Todos los derechos reservados.\nAcceso restringido y protegido por leyes de propiedad intelectual.",
    "background: #111827; color: #F59E0B; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 6px;",
    "color: #9CA3AF; font-size: 11px; font-weight: 500;"
  );
}

import { 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType, 
  testConnection, 
  collection, 
  getDocs, 
  setDoc, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from "./firebase-config.js";
import { productsService } from "./productsService.js";

(function () {
  "use strict";

  // Estado local del panel
  let products = [];
  let filterCategory = "todos";
  let filterStatus = "todos";
  let searchQuery = "";
  let newProductUploadedBase64 = null; // Imagen en base64 subida localmente para el nuevo producto
  const pendingImages = {}; // Registro de imágenes subidas localmente por producto (id -> base64)
  let unsubscribeFirestore = null;

  // Referencias al DOM
  const elements = {
    formAdd: null,
    productsContainer: null,
    totalCountEl: null,
    availableCountEl: null,
    outOfStockCountEl: null,
    searchFilterInput: null,
    categoryFilterSelect: null,
    statusFilterSelect: null,
    toastContainer: null,
    resetDefaultsBtn: null,
    exportJsonBtn: null,
    importJsonInput: null,
    syncStatusEl: null
  };

  // ------------------------------------------------------------------------
  // 🔐 Módulo de Seguridad y Control de Acceso con PIN (Fase 3)
  // ------------------------------------------------------------------------
  const AUTH_SESSION_KEY = "pato_admin_authenticated";

  function getValidPin() {
    const configPin = (typeof window !== "undefined" && window.STORE_CONFIG && window.STORE_CONFIG.adminPin)
      ? String(window.STORE_CONFIG.adminPin).trim()
      : "2026";
    return configPin;
  }

  function isAuthenticated() {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function setAuthenticated(val) {
    try {
      if (val) {
        sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      } else {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.warn("SessionStorage no disponible:", e);
    }
  }

  function showLockScreen() {
    const lockScreen = document.getElementById("admin-lock-screen");
    const appRoot = document.getElementById("admin-app-root");
    const pinInput = document.getElementById("input-admin-pin");
    const errorMsg = document.getElementById("pin-error-msg");

    if (lockScreen) lockScreen.classList.remove("hidden");
    if (appRoot) {
      appRoot.classList.add("hidden");
      appRoot.classList.remove("flex");
    }
    if (errorMsg) errorMsg.classList.add("hidden");
    if (pinInput) {
      pinInput.value = "";
      setTimeout(() => pinInput.focus(), 100);
    }
  }

  async function unlockAdminPanel() {
    const lockScreen = document.getElementById("admin-lock-screen");
    const appRoot = document.getElementById("admin-app-root");

    if (lockScreen) lockScreen.classList.add("hidden");
    if (appRoot) {
      appRoot.classList.remove("hidden");
      appRoot.classList.add("flex");
    }

    // Inicializar o refrescar catálogo al desbloquear
    if (!products || products.length === 0) {
      await loadProducts(false);
    }
  }

  function lockAdminPanel() {
    setAuthenticated(false);
    showLockScreen();
    showToast("🔒 Panel bloqueado con éxito", "info");
  }

  let authListenersInitialized = false;
  function setupAuthListeners() {
    if (authListenersInitialized) return;
    authListenersInitialized = true;

    const formPin = document.getElementById("form-pin-auth");
    const pinInput = document.getElementById("input-admin-pin");
    const errorMsg = document.getElementById("pin-error-msg");
    const lockCard = document.getElementById("lock-card");
    const toggleEyeBtn = document.getElementById("btn-toggle-pin-visibility");
    const lockPanelBtn = document.getElementById("btn-lock-panel");

    const handlePinAttempt = () => {
      if (!pinInput) return;
      const entered = pinInput.value.trim();
      const validPin = getValidPin();

      // Valida contra el PIN de data/config.js, o llaves maestras "2026" / "pato2026"
      if (entered === validPin || entered === "2026" || entered.toLowerCase() === "pato2026") {
        setAuthenticated(true);
        if (errorMsg) errorMsg.classList.add("hidden");
        unlockAdminPanel();
        showToast("🔓 Acceso concedido. ¡Bienvenida a la Pastelería!", "success");
      } else {
        if (errorMsg) errorMsg.classList.remove("hidden");
        if (lockCard) {
          lockCard.classList.remove("animate-shake");
          void lockCard.offsetWidth; // Dispara reflow para reiniciar la animación
          lockCard.classList.add("animate-shake");
        }
        pinInput.value = "";
        pinInput.focus();
      }
    };

    if (formPin) {
      formPin.addEventListener("submit", (e) => {
        e.preventDefault();
        handlePinAttempt();
      });
    }

    // Teclas táctiles para celulares
    document.querySelectorAll(".pin-key").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!pinInput) return;
        const val = btn.getAttribute("data-val");
        if (pinInput.value.length < 12) {
          pinInput.value += val;
        }
      });
    });

    const clearBtn = document.querySelector(".pin-action-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (pinInput) {
          pinInput.value = "";
          pinInput.focus();
        }
      });
    }

    const backspaceBtn = document.querySelector(".pin-action-backspace");
    if (backspaceBtn) {
      backspaceBtn.addEventListener("click", () => {
        if (pinInput && pinInput.value.length > 0) {
          pinInput.value = pinInput.value.slice(0, -1);
        }
      });
    }

    // Alternar visibilidad de la contraseña
    if (toggleEyeBtn && pinInput) {
      toggleEyeBtn.addEventListener("click", () => {
        const isPassword = pinInput.type === "password";
        pinInput.type = isPassword ? "text" : "password";
        toggleEyeBtn.classList.toggle("text-rose-400", isPassword);
      });
    }

    // Botón de bloqueo manual en topbar
    if (lockPanelBtn) {
      lockPanelBtn.addEventListener("click", () => {
        lockAdminPanel();
      });
    }
  }

  /**
   * Inicialización del panel de administración
   */
  async function initAdmin() {
    // Cachear elementos del DOM
    elements.formAdd = document.getElementById("form-add-product");
    elements.productsContainer = document.getElementById("admin-products-list");
    elements.totalCountEl = document.getElementById("stat-total-products");
    elements.availableCountEl = document.getElementById("stat-available-products");
    elements.outOfStockCountEl = document.getElementById("stat-out-of-stock-products");
    elements.searchFilterInput = document.getElementById("admin-search-filter");
    elements.categoryFilterSelect = document.getElementById("admin-category-filter");
    elements.statusFilterSelect = document.getElementById("admin-status-filter");
    elements.resetDefaultsBtn = document.getElementById("btn-reset-defaults");
    elements.exportJsonBtn = document.getElementById("btn-export-json");
    elements.importJsonInput = document.getElementById("input-import-json");
    elements.syncStatusEl = document.getElementById("backend-sync-status");

    // Crear contenedor de notificaciones toast si no existe
    createToastContainer();

    // Actualizar indicador de estado de la conexión
    updateSyncBadge();

    // Eventos del formulario de agregar
    if (elements.formAdd) {
      elements.formAdd.addEventListener("submit", handleAddProduct);
    }

    // Eventos de filtros y búsqueda
    if (elements.searchFilterInput) {
      elements.searchFilterInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProductsList();
      });
    }

    if (elements.categoryFilterSelect) {
      elements.categoryFilterSelect.addEventListener("change", (e) => {
        filterCategory = e.target.value;
        renderProductsList();
      });
    }

    if (elements.statusFilterSelect) {
      elements.statusFilterSelect.addEventListener("change", (e) => {
        filterStatus = e.target.value;
        renderProductsList();
      });
    }

    // Eventos de botones de utilidad
    if (elements.resetDefaultsBtn) {
      elements.resetDefaultsBtn.addEventListener("click", handleResetDefaults);
    }

    if (elements.exportJsonBtn) {
      elements.exportJsonBtn.addEventListener("click", handleExportBackup);
    }

    if (elements.importJsonInput) {
      elements.importJsonInput.addEventListener("change", handleImportBackup);
    }

    // Preview en vivo de imagen en el formulario
    setupImagePreview();

    // Configurar listeners de autenticación por PIN
    setupAuthListeners();

    // Comprobar si ya está autenticado en la sesión actual
    if (isAuthenticated()) {
      unlockAdminPanel();
    } else {
      showLockScreen();
    }
  }

  /**
   * Actualiza el badge superior indicando si está en Cloud Firestore o en Modo Local
   */
  function updateSyncBadge() {
    if (!elements.syncStatusEl) return;

    if (isFirebaseConfigured()) {
      elements.syncStatusEl.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          🔥 Cloud Firestore (En Vivo)
        </span>
      `;
    } else {
      elements.syncStatusEl.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium text-[11px] border border-amber-500/30" title="Para sincronizar en la nube, pegá tus credenciales en firebase-config.js">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          ⚠️ Modo Local (Pegá tus credenciales en firebase-config.js)
        </span>
      `;
    }
  }

  /**
   * Carga los productos desde Cloud Firestore (con onSnapshot) o fallback local
   */
  async function loadProducts(notify = false) {
    try {
      if (isFirebaseConfigured()) {
        console.log("🔥 [Admin] Suscribiéndose a Cloud Firestore con onSnapshot...");
        await testConnection();

        if (unsubscribeFirestore) {
          unsubscribeFirestore();
        }

        const colRef = collection(db, "productos");
        unsubscribeFirestore = onSnapshot(
          colRef,
          (snapshot) => {
            const items = [];
            snapshot.forEach((docSnap) => {
              items.push({
                id: docSnap.id,
                ...docSnap.data()
              });
            });

            if (items.length > 0) {
              products = items;
              updateStats();
              renderProductsList();
              if (notify) {
                showToast(`🔥 ${items.length} productos sincronizados desde Firestore`, "success");
              }
            } else {
              // Si la colección está vacía, sembrar catálogo inicial
              console.info("ℹ️ Colección 'productos' vacía en Firestore. Sembrando catálogo inicial...");
              productsService.seedFirestore().then((seeded) => {
                products = seeded;
                updateStats();
                renderProductsList();
                showToast("Catálogo inicial cargado en Firestore.", "success");
              });
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, "productos");
            console.warn("Error en listener onSnapshot de admin, usando fallback:", error);
            fallbackLoad(notify);
          }
        );

        return;
      }

      // Si no está configurado, usar fallback
      await fallbackLoad(notify);

    } catch (err) {
      console.error("Error al cargar productos en admin:", err);
      await fallbackLoad(notify);
    }
  }

  /**
   * Fallback de carga usando LocalStorage
   */
  async function fallbackLoad(notify = false) {
    try {
      products = await productsService.getProducts();
      updateStats();
      renderProductsList();
      if (notify) {
        showToast("Productos cargados exitosamente (Modo Local).", "success");
      }

      // Sincronización en tiempo real vía 'storage'
      window.addEventListener("storage", async (event) => {
        const key = productsService.STORAGE_KEY || "pato_pasteleria_products_v1";
        if (event.key === key || !event.key) {
          products = await productsService.getProducts();
          updateStats();
          renderProductsList();
        }
      });

      window.addEventListener("products-updated", (event) => {
        if (event.detail && Array.isArray(event.detail.products)) {
          products = event.detail.products;
          updateStats();
          renderProductsList();
        }
      });
    } catch (e) {
      console.error("Error en fallbackLoad:", e);
      showToast("Error al leer el almacenamiento.", "error");
    }
  }

  /**
   * Actualiza los contadores de la barra superior
   */
  function updateStats() {
    const total = products.length;
    const available = products.filter(p => p.disponible !== false && p.disponible !== "agotado").length;
    const outOfStock = total - available;

    if (elements.totalCountEl) elements.totalCountEl.textContent = total;
    if (elements.availableCountEl) elements.availableCountEl.textContent = available;
    if (elements.outOfStockCountEl) elements.outOfStockCountEl.textContent = outOfStock;
  }

  /**
   * Filtra y renderiza la lista de productos en el DOM
   */
  function renderProductsList() {
    if (!elements.productsContainer) return;

    // Aplicar filtros
    const filtered = products.filter((p) => {
      // Filtro de categoría
      if (filterCategory !== "todos" && p.categoria !== filterCategory) {
        return false;
      }

      // Filtro de estado
      const isAvailable = p.disponible !== false && p.disponible !== "agotado";
      if (filterStatus === "disponible" && !isAvailable) return false;
      if (filterStatus === "agotado" && isAvailable) return false;

      // Filtro de búsqueda
      if (searchQuery) {
        const name = (p.nombre || "").toLowerCase();
        const desc = (p.descripcion || "").toLowerCase();
        const cat = (p.categoria || "").toLowerCase();
        if (!name.includes(searchQuery) && !desc.includes(searchQuery) && !cat.includes(searchQuery)) {
          return false;
        }
      }

      return true;
    });

    // Si no hay productos que coincidan
    if (filtered.length === 0) {
      elements.productsContainer.innerHTML = `
        <div class="bg-white rounded-2xl border border-gray-200/80 p-12 text-center max-w-md mx-auto my-6 shadow-xs">
          <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
            🧺
          </div>
          <h4 class="font-display font-bold text-gray-900 text-base mb-1">No se encontraron productos</h4>
          <p class="text-xs text-gray-500 mb-4">
            Probá cambiando los filtros de categoría o el término de búsqueda, o agregá un nuevo producto arriba.
          </p>
          <button onclick="document.getElementById('admin-search-filter').value=''; document.getElementById('admin-category-filter').value='todos'; document.getElementById('admin-status-filter').value='todos'; window.adminApp.loadProducts();"
                  class="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors">
            Limpiar todos los filtros
          </button>
        </div>
      `;
      return;
    }

    // Renderizar tarjetas de edición rápida
    elements.productsContainer.innerHTML = filtered.map(product => createProductCardHtml(product)).join("");
  }

  /**
   * Genera el HTML de una tarjeta de producto con controles de edición rápida
   */
  function createProductCardHtml(product) {
    const isAvailable = product.disponible !== false && product.disponible !== "agotado";
    const statusBg = isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200";
    const statusLabel = isAvailable ? "🟢 Disponible" : "🔴 Agotado";
    const currentPrice = Math.round(Number(product.precio) || 0);

    return `
      <div id="product-card-${product.id}" 
           class="bg-white rounded-2xl border ${isAvailable ? 'border-gray-200/80' : 'border-amber-200 bg-amber-50/20'} p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all">
        
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <!-- Lado Izquierdo: Imagen, Título, Categoría y Badge -->
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Miniatura con botón para reemplazar foto -->
            <div class="relative group/edit-img flex-shrink-0">
              <img id="thumb-preview-${product.id}" 
                   src="${escapeHtml(product.imagen || '')}" 
                   alt="${escapeHtml(product.nombre)}"
                   class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 shadow-inner bg-gray-50 cursor-pointer"
                   onerror="this.src='https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=150&q=80';"
                   onclick="document.getElementById('file-edit-${product.id}').click();"
                   title="Hacé clic para cambiar la foto desde tu dispositivo">
              
              <!-- Botón flotante para subir foto local -->
              <button type="button" 
                      onclick="document.getElementById('file-edit-${product.id}').click();"
                      class="absolute -bottom-1.5 -right-1.5 bg-gray-900/90 hover:bg-emerald-600 text-white p-1 rounded-full shadow border border-white text-[10px] transition-colors"
                      title="Cambiar foto de este producto">
                📷
              </button>

              <!-- Input invisible para seleccionar archivo -->
              <input type="file" 
                     id="file-edit-${product.id}" 
                     accept="image/*" 
                     class="hidden" 
                     onchange="window.adminApp.handleEditImageFile('${product.id}', this)">
            </div>
            
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span id="badge-status-${product.id}" class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg}">
                  ${statusLabel}
                </span>
                <span class="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase">
                  ${escapeHtml(product.categoria || 'tortas')}
                </span>
                ${product.etiqueta ? `
                  <span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    ★ ${escapeHtml(product.etiqueta)}
                  </span>
                ` : ''}
              </div>

              <h4 class="font-display font-bold text-gray-950 text-base sm:text-lg leading-tight truncate">
                ${escapeHtml(product.nombre)}
              </h4>
              <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">
                ${escapeHtml(product.descripcion || 'Sin descripción')}
              </p>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                <span>ID: <code class="text-gray-600 bg-gray-100 px-1 py-0.5 rounded text-[10px]">${escapeHtml(product.id)}</code></span>
                <!-- Botón secundario para cambiar foto -->
                <button type="button"
                        onclick="document.getElementById('file-edit-${product.id}').click();"
                        class="text-amber-700 hover:text-amber-800 font-semibold hover:underline flex items-center gap-1 text-[10px]">
                  <span>📷 Foto local</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Lado Derecho: Controles Inline de Edición Rápida -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            
            <!-- Campo de Precio en Pesos -->
            <div class="w-28 sm:w-32">
              <label for="edit-price-${product.id}" class="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Precio ($)
              </label>
              <div class="relative rounded-xl shadow-xs">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                  <span class="text-gray-400 text-xs font-bold">$</span>
                </div>
                <input type="number" 
                       id="edit-price-${product.id}" 
                       value="${currentPrice}"
                       min="0"
                       step="50"
                       class="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-right font-display"
                       placeholder="0">
              </div>
            </div>

            <!-- Selector de Unidad -->
            <div class="w-24 sm:w-28">
              <label for="edit-unit-${product.id}" class="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Unidad
              </label>
              <select id="edit-unit-${product.id}" 
                      class="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all">
                <option value="unidad" ${product.unidad === 'unidad' ? 'selected' : ''}>/ unidad</option>
                <option value="docena" ${product.unidad === 'docena' ? 'selected' : ''}>/ docena</option>
                <option value="caja" ${product.unidad === 'caja' ? 'selected' : ''}>/ caja</option>
                <option value="bandeja" ${product.unidad === 'bandeja' ? 'selected' : ''}>/ bandeja</option>
                <option value="kg" ${product.unidad === 'kg' ? 'selected' : ''}>/ kg</option>
              </select>
            </div>

            <!-- Selector de Estado de Disponibilidad -->
            <div class="w-28 sm:w-32">
              <label for="edit-status-${product.id}" class="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Estado
              </label>
              <select id="edit-status-${product.id}" 
                      class="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all">
                <option value="disponible" ${isAvailable ? 'selected' : ''}>🟢 Disponible</option>
                <option value="agotado" ${!isAvailable ? 'selected' : ''}>🔴 Agotado</option>
              </select>
            </div>

            <!-- Botones de Acción (Guardar y Eliminar) -->
            <div class="flex items-center gap-1.5 self-end">
              <button id="btn-save-${product.id}" 
                      onclick="window.adminApp.saveProduct('${product.id}')"
                      class="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
                      title="Guardar cambios de precio y disponibilidad">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Guardar</span>
              </button>

              <button onclick="window.adminApp.deleteProduct('${product.id}', '${escapeHtml(product.nombre)}')" 
                      class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-transparent hover:border-red-200 flex items-center justify-center transition-all active:scale-95"
                      title="Eliminar este producto del catálogo">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

          </div>

        </div>

      </div>
    `;
  }

  /**
   * Manejador para agregar un nuevo producto (con Cloud Firestore o fallback)
   */
  async function handleAddProduct(e) {
    e.preventDefault();

    try {
      const nombre = document.getElementById("new-product-nombre").value.trim();
      const categoria = document.getElementById("new-product-categoria").value;
      const precio = Number(document.getElementById("new-product-precio").value);
      const unidad = document.getElementById("new-product-unidad").value;
      const imagenUrl = document.getElementById("new-product-imagen").value.trim();
      const descripcion = document.getElementById("new-product-descripcion").value.trim();
      const etiqueta = document.getElementById("new-product-etiqueta").value.trim();
      const estado = document.getElementById("new-product-estado").value;

      // Validaciones básicas
      if (!nombre) {
        showToast("Por favor escribí el nombre del producto.", "error");
        document.getElementById("new-product-nombre").focus();
        return;
      }

      if (isNaN(precio) || precio < 0) {
        showToast("El precio debe ser un número válido mayor o igual a 0.", "error");
        document.getElementById("new-product-precio").focus();
        return;
      }

      // Generar ID único
      let baseId = nombre
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!baseId) baseId = "prod-" + Date.now();
      const uniqueId = `${baseId}-${Date.now().toString().slice(-4)}`;

      // Priorizar imagen cargada desde el dispositivo (comprimida al instante) o URL de texto
      let finalImage = imagenUrl || getPresetImageForCategory(categoria);
      if (newProductUploadedBase64) {
        finalImage = newProductUploadedBase64;
      }

      const newProd = {
        id: uniqueId,
        nombre,
        categoria: categoria || "tortas",
        precio,
        unidad: unidad || "unidad",
        imagen: finalImage,
        descripcion: descripcion || "Delicia artesanal de Pastelería Pato.",
        etiqueta: etiqueta || "Especialidad",
        disponible: estado === "disponible",
        destacado: true,
        updatedAt: new Date().toISOString()
      };

      // Si Firebase está configurado, guardar directamente en Firestore
      if (isFirebaseConfigured()) {
        const docRef = doc(db, "productos", uniqueId);
        await setDoc(docRef, newProd);
        console.log(`🔥 [Firestore] Producto guardado en Firestore: ${uniqueId}`);
        showToast(`¡"${nombre}" guardado en Cloud Firestore!`, "success");
      } else {
        await productsService.addProduct(newProd);
        showToast(`¡"${nombre}" agregado con éxito al catálogo!`, "success");
      }

      // Limpiar campos del formulario
      document.getElementById("new-product-nombre").value = "";
      document.getElementById("new-product-precio").value = "";
      document.getElementById("new-product-imagen").value = "";
      document.getElementById("new-product-descripcion").value = "";
      document.getElementById("new-product-etiqueta").value = "";
      
      // Resetear estado de imagen local subida
      newProductUploadedBase64 = null;
      const newFileInp = document.getElementById("new-product-file");
      if (newFileInp) newFileInp.value = "";
      const newFileStatus = document.getElementById("new-product-file-status");
      if (newFileStatus) {
        newFileStatus.textContent = "O pegá una URL a la derecha";
        newFileStatus.classList.remove("text-brand-600", "font-semibold");
        newFileStatus.classList.add("text-gray-400");
      }

      const previewImg = document.getElementById("new-product-preview");
      if (previewImg) {
        previewImg.src = getPresetImageForCategory(categoria);
      }

      await loadProducts();

      // Scroll suave a la lista
      const listEl = document.getElementById("seccion-catalogo");
      if (listEl) {
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "productos");
      console.error("Error al agregar producto:", err);
      showToast("Error al guardar el nuevo producto en Firestore.", "error");
    }
  }

  /**
   * Guarda los cambios de un producto existente (precio, unidad, disponibilidad y foto)
   */
  async function saveProduct(id) {
    const priceInput = document.getElementById(`edit-price-${id}`);
    const unitSelect = document.getElementById(`edit-unit-${id}`);
    const statusSelect = document.getElementById(`edit-status-${id}`);
    const saveBtn = document.getElementById(`btn-save-${id}`);

    if (!priceInput || !unitSelect || !statusSelect) return;

    const newPrice = Number(priceInput.value);
    if (isNaN(newPrice) || newPrice < 0) {
      showToast("El precio debe ser un número válido mayor o igual a 0.", "error");
      priceInput.focus();
      return;
    }

    const newUnit = unitSelect.value;
    const newStatus = statusSelect.value === "disponible";

    // Efecto de guardando en el botón
    const originalBtnHtml = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.innerHTML = `<span>⏳</span><span>Guardando...</span>`;
      saveBtn.disabled = true;
    }

    try {
      const updateData = {
        precio: newPrice,
        unidad: newUnit,
        disponible: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Si se cargó una nueva imagen desde el dispositivo para este producto, asignarla directamente (comprimida)
      if (pendingImages[id]) {
        updateData.imagen = pendingImages[id];
      }

      if (isFirebaseConfigured()) {
        const docRef = doc(db, "productos", id);
        await updateDoc(docRef, updateData);
        console.log(`🔥 [Firestore] Documento ${id} actualizado en Firestore.`);
      } else {
        await productsService.updateProduct(id, updateData);
      }

      // Limpiar pendingImage tras guardado exitoso
      delete pendingImages[id];

      // Actualizar estado local
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updateData };
      }
      updateStats();

      // Feedback visual
      if (saveBtn) {
        saveBtn.innerHTML = `<span>✅</span><span>¡Guardado!</span>`;
        saveBtn.classList.remove("bg-brand-600");
        saveBtn.classList.add("bg-emerald-600");

        setTimeout(() => {
          saveBtn.innerHTML = originalBtnHtml;
          saveBtn.classList.remove("bg-emerald-600");
          saveBtn.classList.add("bg-brand-600");
          saveBtn.disabled = false;
        }, 1200);
      }

      // Actualizar badge visual en la fila
      const badgeStatus = document.getElementById(`badge-status-${id}`);
      if (badgeStatus) {
        badgeStatus.className = `text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          newStatus ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
        }`;
        badgeStatus.textContent = newStatus ? '🟢 Disponible' : '🔴 Agotado';
      }

      // Actualizar estilo del contenedor si cambió a agotado
      const card = document.getElementById(`product-card-${id}`);
      if (card) {
        if (newStatus) {
          card.classList.remove("border-amber-200", "bg-amber-50/20");
          card.classList.add("border-gray-200/80");
        } else {
          card.classList.remove("border-gray-200/80");
          card.classList.add("border-amber-200", "bg-amber-50/20");
        }
      }

      showToast(`¡Cambios de "${products.find(p => p.id === id)?.nombre || id}" guardados!`, "success");

    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `productos/${id}`);
      console.error("Error al actualizar producto:", err);
      showToast("Error al guardar los cambios.", "error");

      if (saveBtn) {
        saveBtn.innerHTML = originalBtnHtml;
        saveBtn.disabled = false;
      }
    }
  }

  /**
   * Elimina un producto por ID tras confirmación
   */
  async function deleteProduct(id, name) {
    const confirmMessage = `¿Estás seguro de que deseás eliminar "${name}" del catálogo?`;
    if (!confirm(confirmMessage)) return;

    try {
      if (isFirebaseConfigured()) {
        const docRef = doc(db, "productos", id);
        await deleteDoc(docRef);
        console.log(`🔥 [Firestore] Documento ${id} eliminado de Firestore.`);
      } else {
        await productsService.deleteProduct(id);
      }

      // Remover del estado local si no está activo onSnapshot
      products = products.filter(p => p.id !== id);
      delete pendingImages[id];
      updateStats();
      renderProductsList();

      showToast(`"${name}" fue eliminado del catálogo.`, "info");

    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `productos/${id}`);
      console.error("Error al eliminar producto:", err);
      showToast("Error al eliminar el producto.", "error");
    }
  }

  /**
   * Manejador para carga de foto local en producto existente (Editar foto)
   */
  function handleEditImageFile(productId, inputElement) {
    if (!inputElement || !inputElement.files || inputElement.files.length === 0) return;

    const file = inputElement.files[0];
    if (!file.type.startsWith("image/")) {
      showToast("Por favor seleccioná un archivo de imagen válido (JPG, PNG, WEBP).", "error");
      return;
    }

    // Comprimir imagen local para no sobrecargar el almacenamiento
    compressImageFile(file, 640, 640, 0.75, async (dataUrl) => {
      pendingImages[productId] = dataUrl;

      // Actualizar vista previa en vivo en la tarjeta del producto
      const previewImg = document.getElementById(`thumb-preview-${productId}`);
      if (previewImg) {
        previewImg.src = dataUrl;
      }

      // Notificar al dueño
      showToast("Foto cargada. Presioná 'Guardar' para confirmar los cambios.", "success");

      // Resaltar el botón de guardar
      const saveBtn = document.getElementById(`btn-save-${productId}`);
      if (saveBtn) {
        saveBtn.classList.add("ring-2", "ring-emerald-400", "animate-bounce");
        setTimeout(() => {
          saveBtn.classList.remove("ring-2", "ring-emerald-400", "animate-bounce");
        }, 1600);
      }
    });
  }

  /**
   * Restablece el catálogo a los datos por defecto / Siembra en Firestore
   */
  async function handleResetDefaults() {
    const isCloud = isFirebaseConfigured();
    const promptMsg = isCloud
      ? "¿Deseás subir y restablecer todo el catálogo inicial de tortas y delicias a Cloud Firestore?"
      : "¿Deseás restablecer el catálogo de Pastelería Pato a los valores originales?";

    if (!confirm(promptMsg)) return;

    try {
      if (isCloud) {
        await productsService.seedFirestore();
        showToast("🔥 ¡Catálogo inicial subido con éxito a Cloud Firestore!", "success");
      } else {
        await productsService.resetToDefaults();
        showToast("Catálogo restablecido a valores por defecto.", "success");
      }
      await loadProducts();
    } catch (err) {
      console.error("Error al restablecer catálogo:", err);
      showToast("Error al restablecer el catálogo.", "error");
    }
  }

  /**
   * Exporta la base de datos actual en formato JSON descargable
   */
  function handleExportBackup() {
    try {
      const dataStr = JSON.stringify(products, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `pasteleria-pato-catalogo-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Copia de seguridad descargada con éxito.", "success");
    } catch (err) {
      console.error("Error al exportar JSON:", err);
      showToast("Error al generar la copia de seguridad.", "error");
    }
  }

  /**
   * Importa productos desde un archivo JSON
   */
  function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          throw new Error("El archivo no contiene un array de productos válido.");
        }

        if (isFirebaseConfigured()) {
          const batch = writeBatch(db);
          for (const item of imported) {
            const docRef = doc(db, "productos", item.id);
            batch.set(docRef, item);
          }
          await batch.commit();
          showToast(`¡${imported.length} productos importados a Cloud Firestore!`, "success");
        } else {
          await productsService.saveProducts(imported);
          showToast(`¡${imported.length} productos importados con éxito!`, "success");
        }

        await loadProducts();
      } catch (err) {
        console.error("Error al importar JSON:", err);
        showToast("Error al importar: formato de archivo inválido.", "error");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  /**
   * Comprime una imagen a Base64
   */
  function compressImageFile(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Configura la previsualización en vivo de la imagen en el formulario
   */
  function setupImagePreview() {
    const previewImg = document.getElementById("new-product-preview");
    const urlInput = document.getElementById("new-product-imagen");
    const catSelect = document.getElementById("new-product-categoria");
    const fileInput = document.getElementById("new-product-file");
    const fileStatus = document.getElementById("new-product-file-status");

    if (!previewImg) return;

    // Selector de archivo local desde la computadora o teléfono móvil
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
          const file = this.files[0];
          if (!file.type.startsWith("image/")) {
            showToast("Por favor seleccioná un archivo de imagen.", "error");
            return;
          }

          compressImageFile(file, 640, 640, 0.75, (dataUrl) => {
            newProductUploadedBase64 = dataUrl;
            previewImg.src = dataUrl;

            if (fileStatus) {
              fileStatus.textContent = `✓ Foto cargada: ${file.name.slice(0, 20)}...`;
              fileStatus.classList.remove("text-gray-400");
              fileStatus.classList.add("text-brand-600", "font-semibold");
            }

            if (urlInput) urlInput.value = "";
            showToast("Foto cargada desde tu dispositivo.", "info");
          });
        }
      });
    }

    if (urlInput) {
      urlInput.addEventListener("input", (e) => {
        newProductUploadedBase64 = null;
        if (fileInput) fileInput.value = "";
        if (fileStatus) {
          fileStatus.textContent = "O pegá una URL a la derecha";
          fileStatus.classList.remove("text-brand-600", "font-semibold");
          fileStatus.classList.add("text-gray-400");
        }

        const val = e.target.value.trim();
        if (val) {
          previewImg.src = val;
        } else if (catSelect) {
          previewImg.src = getPresetImageForCategory(catSelect.value);
        }
      });
    }

    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        if (!newProductUploadedBase64 && (!urlInput || !urlInput.value.trim())) {
          previewImg.src = getPresetImageForCategory(e.target.value);
        }
      });
    }
  }

  /**
   * Retorna una imagen representativa para cada categoría si no se especifica una
   */
  function getPresetImageForCategory(cat) {
    switch (cat) {
      case "tortas":
        return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
      case "tartas":
        return "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80";
      case "alfajores":
        return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80";
      case "budines":
        return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80";
      default:
        return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
    }
  }

  /**
   * Sistema de Notificaciones Toast flotante
   */
  function createToastContainer() {
    if (document.getElementById("admin-toast-container")) return;
    const container = document.createElement("div");
    container.id = "admin-toast-container";
    container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full";
    document.body.appendChild(container);
    elements.toastContainer = container;
  }

  function showToast(message, type = "info") {
    if (typeof window.Toastify === "function") {
      let bg = "linear-gradient(135deg, #059669 0%, #047857 100%)";
      if (type === "error") bg = "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)";
      if (type === "info") bg = "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)";

      window.Toastify({
        text: message,
        duration: 2800,
        gravity: "bottom",
        position: "right",
        style: {
          background: bg,
          borderRadius: "14px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          fontSize: "13px",
          fontWeight: "600",
          color: "#FFFFFF"
        }
      }).showToast();
      return;
    }

    const container = elements.toastContainer || document.getElementById("admin-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    let bg = "bg-emerald-600 text-white";
    let icon = "✓";
    if (type === "error") {
      bg = "bg-red-600 text-white";
      icon = "✕";
    } else if (type === "info") {
      bg = "bg-brand-900 text-emerald-300";
      icon = "ℹ";
    }

    toast.className = `${bg} p-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold pointer-events-auto transform translate-y-4 opacity-0 transition-all duration-300 border border-white/10`;
    toast.innerHTML = `
      <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black">${icon}</span>
      <span class="flex-1 leading-snug">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("translate-y-4", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Exponer API para handlers en HTML (onclick y onchange)
  window.adminApp = {
    init: initAdmin,
    saveProduct,
    deleteProduct,
    loadProducts,
    handleEditImageFile,
    seedFirestore: handleResetDefaults,
    lockAdminPanel,
    unlockAdminPanel
  };

  // Autoejecución al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
  } else {
    initAdmin();
  }

})();
