/**
 * 🍰 Panel de Administración - Pastelería Pato (Vanilla JavaScript)
 * Nervo y Laínez, Haedo, Buenos Aires
 * 
 * Lógica CRUD pura para la dueña de la pastelería (Pato).
 * Gestiona el catálogo persistido en localStorage mediante productsService
 * y asegura la sincronización bidireccional inmediata con la tienda.
 */

(function () {
  "use strict";

  // Estado local del panel
  let products = [];
  let filterCategory = "todos";
  let filterStatus = "todos";
  let searchQuery = "";
  let newProductUploadedBase64 = null; // Almacena la imagen en base64 subida localmente para el nuevo producto
  const pendingImages = {}; // Registro de imágenes subidas localmente por producto (id -> base64)

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
    importJsonInput: null
  };

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

    // Crear contenedor de notificaciones toast si no existe
    createToastContainer();

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

    // Cargar productos iniciales
    await loadProducts();

    // Sincronización en tiempo real vía 'storage' (otra pestaña)
    window.addEventListener("storage", async (event) => {
      const key = (window.productsService && window.productsService.STORAGE_KEY) || "pasteleria_pato_products_v1";
      if (event.key === key || !event.key) {
        showToast("⚡ Catálogo sincronizado desde otra pestaña", "info");
        await loadProducts(false);
      }
    });

    // Sincronización en la misma pestaña
    window.addEventListener("products-updated", async (event) => {
      if (event.detail && Array.isArray(event.detail.products)) {
        products = event.detail.products;
        updateStats();
        renderProductsList();
      }
    });

    // Preview en vivo de imagen en el formulario
    setupImagePreview();
  }

  /**
   * Carga los productos desde productsService
   */
  async function loadProducts(notify = false) {
    try {
      if (!window.productsService) {
        throw new Error("El servicio productsService no está disponible.");
      }
      products = await window.productsService.getProducts();
      updateStats();
      renderProductsList();
      if (notify) {
        showToast("Productos cargados exitosamente.", "success");
      }
    } catch (err) {
      console.error("Error al cargar productos en admin:", err);
      showToast("Error al leer el almacenamiento local.", "error");
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

    if (filtered.length === 0) {
      elements.productsContainer.innerHTML = `
        <div class="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
            🥬
          </div>
          <h4 class="text-base font-bold text-gray-800 mb-1">No hay productos que coincidan</h4>
          <p class="text-xs text-gray-500 max-w-sm mx-auto">
            Ajustá los filtros de búsqueda o agregá un nuevo producto desde el formulario de arriba.
          </p>
        </div>
      `;
      return;
    }

    // Renderizado de las tarjetas / filas de edición
    elements.productsContainer.innerHTML = filtered.map((product) => {
      const isAvailable = product.disponible !== false && product.disponible !== "agotado";
      const priceVal = Number(product.precio) || 0;
      const formattedPrice = formatCurrency(priceVal);

      return `
        <div id="product-card-${escapeHtml(product.id)}" 
             class="admin-card bg-white rounded-2xl p-4 sm:p-5 border ${isAvailable ? 'border-gray-200' : 'border-amber-200 bg-amber-50/20'} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <!-- Lado Izquierdo: Miniatura e Info Básica -->
          <div class="flex items-center gap-3.5 sm:gap-4 min-w-[230px]">
            <div class="flex flex-col items-center flex-shrink-0">
              <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group shadow-2xs">
                <img id="img-preview-${escapeHtml(product.id)}" 
                     src="${escapeHtml(product.imagen || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80')}" 
                     alt="${escapeHtml(product.nombre)}" 
                     class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                     onerror="this.src='https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80';">
                <span class="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/60 text-white backdrop-blur-xs">
                  ${escapeHtml(product.categoria || 'huerta')}
                </span>
                
                <!-- Overlay accesible para cambiar foto al hacer clic en escritorio -->
                <label for="edit-file-${escapeHtml(product.id)}" 
                       class="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-bold p-1 text-center backdrop-blur-2xs"
                       title="Cambiar foto de ${escapeHtml(product.nombre)} desde tu dispositivo">
                  <span class="text-base">📷</span>
                  <span>Cambiar</span>
                </label>
              </div>

              <!-- Botón visible directo para celular y computadora -->
              <label for="edit-file-${escapeHtml(product.id)}" 
                     class="mt-1 text-[10px] font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 py-0.5 px-2 rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                     title="Subir nueva foto desde tu dispositivo para ${escapeHtml(product.nombre)}">
                <span>📷</span>
                <span>Foto local</span>
              </label>
              <input type="file" 
                     id="edit-file-${escapeHtml(product.id)}" 
                     accept="image/*" 
                     class="hidden" 
                     onchange="window.adminApp.handleEditImageFile('${escapeHtml(product.id)}', this)">
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h4 class="text-base font-bold text-gray-900 truncate font-display">
                  ${escapeHtml(product.nombre)}
                </h4>
                <span id="badge-status-${escapeHtml(product.id)}" 
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-600 border-red-200'
                      }">
                  ${isAvailable ? '🟢 Disponible' : '🔴 Agotado'}
                </span>
                ${product.etiqueta ? `
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    ${escapeHtml(product.etiqueta)}
                  </span>
                ` : ''}
              </div>

              <p class="text-xs text-gray-500 line-clamp-1 mb-1">
                ${escapeHtml(product.descripcion || 'Sin descripción')}
              </p>
              
              <p class="text-xs font-semibold text-gray-400">
                ID: <span class="font-mono text-gray-600 text-[11px]">${escapeHtml(product.id)}</span>
                • Actual: <span class="font-bold text-brand-700">${formattedPrice} / ${escapeHtml(product.unidad)}</span>
              </p>
            </div>
          </div>

          <!-- Centro y Lado Derecho: Controles de Edición en Tiempo Real -->
          <div class="flex flex-wrap items-center gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-200/80 w-full md:w-auto">
            
            <!-- Campo Precio -->
            <div class="flex-1 sm:flex-initial">
              <label for="edit-price-${escapeHtml(product.id)}" class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Precio ($ ARS)
              </label>
              <div class="relative rounded-lg shadow-xs">
                <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 font-bold text-xs pointer-events-none">$</span>
                <input id="edit-price-${escapeHtml(product.id)}" 
                       type="number" 
                       min="0" 
                       step="50"
                       value="${priceVal}" 
                       class="pl-6 pr-2 py-1.5 w-28 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                       title="Precio de venta">
              </div>
            </div>

            <!-- Campo Unidad -->
            <div>
              <label for="edit-unit-${escapeHtml(product.id)}" class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Unidad
              </label>
              <select id="edit-unit-${escapeHtml(product.id)}" 
                      class="py-1.5 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="unidad" ${product.unidad === 'unidad' ? 'selected' : ''}>unidad</option>
                <option value="porción" ${product.unidad === 'porción' ? 'selected' : ''}>porción</option>
                <option value="docena" ${product.unidad === 'docena' ? 'selected' : ''}>docena</option>
                <option value="media docena" ${product.unidad === 'media docena' ? 'selected' : ''}>media docena</option>
                <option value="kg" ${product.unidad === 'kg' ? 'selected' : ''}>kg (Kilo)</option>
                <option value="caja" ${product.unidad === 'caja' ? 'selected' : ''}>caja</option>
              </select>
            </div>

            <!-- Campo Disponibilidad (Estado) -->
            <div>
              <label for="edit-status-${escapeHtml(product.id)}" class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Estado
              </label>
              <select id="edit-status-${escapeHtml(product.id)}" 
                      class="py-1.5 px-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="disponible" ${isAvailable ? 'selected' : ''}>🟢 Disponible</option>
                <option value="agotado" ${!isAvailable ? 'selected' : ''}>🔴 Agotado</option>
              </select>
            </div>

            <!-- Botones de Acción: Guardar y Eliminar -->
            <div class="flex items-center gap-1.5 pt-4 sm:pt-0 self-end sm:self-center ml-auto sm:ml-2">
              
              <!-- Botón Guardar Cambios -->
              <button type="button" 
                      onclick="window.adminApp.saveProduct('${escapeHtml(product.id)}')"
                      id="btn-save-${escapeHtml(product.id)}"
                      class="bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                      title="Guardar cambios de precio, unidad y disponibilidad">
                <span>💾</span>
                <span>Guardar</span>
              </button>

              <!-- Botón Eliminar -->
              <button type="button" 
                      onclick="window.adminApp.deleteProduct('${escapeHtml(product.id)}')"
                      class="bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 active:scale-95 font-medium text-xs p-2 rounded-xl transition-all"
                      title="Eliminar producto permanentemente">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>

            </div>

          </div>

        </div>
      `;
    }).join("");
  }

  /**
   * Manejador para agregar un nuevo producto desde el formulario
   */
  async function handleAddProduct(e) {
    e.preventDefault();

    const nombre = document.getElementById("new-product-nombre")?.value?.trim();
    const categoria = document.getElementById("new-product-categoria")?.value;
    const precioRaw = document.getElementById("new-product-precio")?.value;
    const unidad = document.getElementById("new-product-unidad")?.value;
    const imagen = document.getElementById("new-product-imagen")?.value?.trim();
    const estado = document.getElementById("new-product-estado")?.value;
    const descripcion = document.getElementById("new-product-descripcion")?.value?.trim();
    const etiqueta = document.getElementById("new-product-etiqueta")?.value?.trim();

    if (!nombre) {
      showToast("El nombre del producto es obligatorio.", "error");
      document.getElementById("new-product-nombre")?.focus();
      return;
    }

    const precio = Number(precioRaw);
    if (isNaN(precio) || precio < 0) {
      showToast("Ingresá un precio válido mayor o igual a 0.", "error");
      document.getElementById("new-product-precio")?.focus();
      return;
    }

    // Imagen: usar la foto cargada desde el dispositivo si existe, o la URL ingresada, o el preset
    const fallbackImage = getPresetImageForCategory(categoria);
    const finalImage = newProductUploadedBase64 || imagen || fallbackImage;

    try {
      const newProd = {
        nombre,
        categoria: categoria || "tortas",
        precio,
        unidad: unidad || "unidad",
        imagen: finalImage,
        descripcion: descripcion || "Elaborada artesanalmente en el obrador de Pastelería Pato.",
        etiqueta: etiqueta || "Del Obrador",
        disponible: estado === "disponible",
        destacado: true
      };

      await window.productsService.addProduct(newProd);

      // Limpiar campos principales del formulario
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
      showToast(`¡"${nombre}" agregado con éxito al catálogo!`, "success");

      // Scroll suave a la lista
      const listEl = document.getElementById("seccion-catalogo");
      if (listEl) {
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }

    } catch (err) {
      console.error("Error al agregar producto:", err);
      showToast("Error al guardar el nuevo producto.", "error");
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
        disponible: newStatus
      };

      // Si se cargó una nueva imagen desde el dispositivo para este producto, incluirla
      if (pendingImages[id]) {
        updateData.imagen = pendingImages[id];
      }

      const updated = await window.productsService.updateProduct(id, updateData);

      // Limpiar pendingImage tras guardado exitoso
      delete pendingImages[id];

      // Actualizar estado local
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        products[idx] = updated;
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
          card.classList.add("border-gray-200");
        } else {
          card.classList.remove("border-gray-200");
          card.classList.add("border-amber-200", "bg-amber-50/20");
        }
      }

      showToast(`¡${updated.nombre} actualizado (${formatCurrency(newPrice)} / ${newUnit})!`, "success");

    } catch (err) {
      console.error("Error al actualizar producto:", err);
      showToast("No se pudo actualizar el producto.", "error");
      if (saveBtn) {
        saveBtn.innerHTML = originalBtnHtml;
        saveBtn.disabled = false;
      }
    }
  }

  /**
   * Elimina un producto tras confirmación
   */
  async function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    const prodName = product ? product.nombre : "este producto";

    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar "${prodName}" del catálogo?\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await window.productsService.deleteProduct(id);
      products = products.filter(p => p.id !== id);
      updateStats();
      renderProductsList();
      showToast(`Producto "${prodName}" eliminado correctamente.`, "info");
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      showToast("Error al eliminar el producto.", "error");
    }
  }

  /**
   * Restablece el catálogo a los valores de fábrica
   */
  async function handleResetDefaults() {
    const confirmed = window.confirm(
      "⚠️ ¿Deseás restablecer el catálogo a la lista original por defecto?\n" +
      "Se reemplazarán los cambios actuales en localStorage por los productos iniciales del puesto."
    );

    if (!confirmed) return;

    try {
      await window.productsService.resetToDefaults();
      await loadProducts();
      showToast("Catálogo restablecido a los valores originales por defecto.", "success");
    } catch (err) {
      console.error("Error al restablecer:", err);
      showToast("Error al restablecer los valores por defecto.", "error");
    }
  }

  /**
   * Descarga una copia de seguridad JSON
   */
  function handleExportBackup() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `catalogo_pasteleria_pato_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Copia de seguridad descargada exitosamente.", "success");
    } catch (e) {
      showToast("Error al exportar la copia de seguridad.", "error");
    }
  }

  /**
   * Carga una copia de seguridad JSON
   */
  function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          throw new Error("El archivo JSON debe contener un array de productos.");
        }

        const confirmed = window.confirm(
          `Se encontraron ${imported.length} productos en el archivo. ¿Querés cargarlos y reemplazar los actuales?`
        );
        if (!confirmed) return;

        await window.productsService.saveProducts(imported);
        await loadProducts();
        showToast("¡Copia de seguridad importada con éxito!", "success");
      } catch (err) {
        showToast("Archivo JSON no válido o corrupto.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /**
   * Procesa, redimensiona y comprime una imagen local seleccionada por el usuario.
   * La convierte en un Data URL (JPEG) liviano (~25-45 KB) perfecto para almacenar
   * en localStorage sin saturar el límite de almacenamiento del navegador.
   */
  function processImageFile(file, maxWidth = 550, maxHeight = 550, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error("No se seleccionó ningún archivo de imagen."));
      }
      if (!file.type || !file.type.startsWith("image/")) {
        return reject(new Error("El archivo seleccionado no es una imagen válida (debe ser JPG, PNG, WEBP, etc.)."));
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Escalar manteniendo proporción
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          // Fondo blanco para imágenes con transparencia convertidas a JPEG
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Obtener cadena data URL optimizada
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("No se pudo decodificar la imagen seleccionada."));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo desde tu dispositivo."));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Permite cambiar la foto de un producto existente cargando una imagen desde el dispositivo
   */
  async function handleEditImageFile(productId, fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const product = products.find(p => p.id === productId);
    const prodName = product ? product.nombre : "producto";

    try {
      showToast("Optimizando foto...", "info");
      const dataUrl = await processImageFile(file, 550, 550, 0.82);

      // Actualizar vista previa en la tarjeta de inmediato
      const imgPreview = document.getElementById(`img-preview-${productId}`);
      if (imgPreview) {
        imgPreview.src = dataUrl;
      }

      // Guardar en pendingImages por si el usuario presiona "Guardar"
      pendingImages[productId] = dataUrl;

      // Persistir de inmediato el cambio de imagen en localStorage
      const updated = await window.productsService.updateProduct(productId, { imagen: dataUrl });
      const idx = products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        products[idx] = updated;
      }

      showToast(`¡Foto de "${prodName}" actualizada con éxito!`, "success");
    } catch (err) {
      console.error("Error al procesar foto local:", err);
      showToast(err.message || "No se pudo cargar la foto.", "error");
    } finally {
      fileInput.value = "";
    }
  }

  /**
   * Configura la vista previa interactiva de la imagen en el formulario
   */
  function setupImagePreview() {
    const urlInput = document.getElementById("new-product-imagen");
    const previewImg = document.getElementById("new-product-preview");
    const categorySelect = document.getElementById("new-product-categoria");
    const fileInput = document.getElementById("new-product-file");
    const fileStatus = document.getElementById("new-product-file-status");

    if (!previewImg) return;

    // Listener para subir foto desde dispositivo local al agregar nuevo producto
    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast("Procesando imagen de tu dispositivo...", "info");
          const dataUrl = await processImageFile(file, 550, 550, 0.82);
          newProductUploadedBase64 = dataUrl;
          previewImg.src = dataUrl;

          if (fileStatus) {
            fileStatus.textContent = `✓ Foto cargada: ${file.name.substring(0, 16)}...`;
            fileStatus.classList.remove("text-gray-400");
            fileStatus.classList.add("text-brand-600", "font-bold");
          }

          if (urlInput) {
            urlInput.value = "";
          }

          showToast("¡Foto local cargada para el nuevo producto!", "success");
        } catch (err) {
          console.error("Error al procesar archivo local:", err);
          showToast(err.message || "Error al procesar la imagen local.", "error");
        }
      });
    }

    // Actualizar al tipear URL (si el usuario tipea una URL web, desestima la foto local previa)
    if (urlInput) {
      urlInput.addEventListener("input", () => {
        const url = urlInput.value.trim();
        if (url) {
          newProductUploadedBase64 = null;
          previewImg.src = url;
          if (fileStatus) {
            fileStatus.textContent = "Usando URL web ingresada";
            fileStatus.classList.remove("text-brand-600", "font-bold");
            fileStatus.classList.add("text-gray-400");
          }
        } else if (newProductUploadedBase64) {
          previewImg.src = newProductUploadedBase64;
        } else if (categorySelect) {
          previewImg.src = getPresetImageForCategory(categorySelect.value);
        }
      });
    }

    // Actualizar imagen por defecto si cambia categoría y no hay foto cargada ni URL personalizada
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        if (!urlInput?.value?.trim() && !newProductUploadedBase64) {
          previewImg.src = getPresetImageForCategory(categorySelect.value);
        }
      });
    }
  }

  /**
   * Imágenes de alta calidad temáticas de reemplazo por categoría en pastelería
   */
  function getPresetImageForCategory(cat) {
    switch (cat) {
      case "tortas":
        return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
      case "facturas":
        return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80";
      case "alfajores":
        return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80";
      case "postres":
        return "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80";
      default:
        return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
    }
  }

  /**
   * Notificaciones flotantes tipo Toast en JavaScript vanilla
   */
  function createToastContainer() {
    if (document.getElementById("admin-toast-container")) return;
    const container = document.createElement("div");
    container.id = "admin-toast-container";
    container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm";
    document.body.appendChild(container);
    elements.toastContainer = container;
  }

  function showToast(message, type = "info") {
    // Si Toastify está presente en el documento, usarlo
    if (window.Toastify) {
      let bg = "linear-gradient(135deg, #059669 0%, #047857 100%)";
      if (type === "error") bg = "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)";
      if (type === "info") bg = "linear-gradient(135deg, #374151 0%, #1F2937 100%)";

      Toastify({
        text: message,
        duration: 2800,
        gravity: "bottom",
        position: "right",
        style: {
          background: bg,
          borderRadius: "14px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
          fontSize: "13px",
          fontWeight: "600",
          color: "#FFFFFF"
        }
      }).showToast();
      return;
    }

    // Fallback nativo
    if (!elements.toastContainer) createToastContainer();
    const toast = document.createElement("div");
    const colors = {
      success: "bg-emerald-700 text-white border-emerald-500",
      error: "bg-red-700 text-white border-red-500",
      info: "bg-gray-800 text-white border-gray-600"
    };

    toast.className = `${colors[type] || colors.info} border px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold pointer-events-auto transform transition-all duration-300 translate-y-4 opacity-0`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-x-4");
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
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
    handleEditImageFile
  };

  // Autoejecución al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
  } else {
    initAdmin();
  }

})();
