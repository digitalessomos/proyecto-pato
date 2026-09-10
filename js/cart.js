/**
 * 🎂 Carrito de Compras Reactivo - Pastelería Pato (Haedo, Buenos Aires)
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * Todos los derechos reservados / All Rights Reserved.
 * 
 * Gestiona el estado reactivo global del carrito mediante Alpine.store('cart'),
 * persistencia en localStorage, notificaciones Toastify y despacho estructurado a WhatsApp.
 */

export function setupCartStore(AlpineInstance) {
  const alpine = AlpineInstance || (typeof window !== "undefined" ? window.Alpine : null);
  if (!alpine) return;

  try {
    if (alpine.store("cart")) return;
  } catch (e) {
    // Store todavía no existe, procedemos
  }

  alpine.store("cart", {
    // Estado del Carrito
    items: [],
    isOpen: false,
    storageKey: "pato_pasteleria_cart_v1",

    // Datos del Cliente y Checkout
    customerName: "",
    deliveryType: "retiro", // 'retiro' | 'delivery'
    customerAddress: "",
    paymentMethod: "efectivo", // 'efectivo' | 'transferencia' | 'mercadopago'
    notes: "",
    aliasCopied: false,

    // Alias y titular de pago (editable desde STORE_CONFIG en data/config.js)
    get paymentAlias() {
      const config = (typeof window !== "undefined" && (window.STORE_CONFIG || window.storeInfo)) || {};
      return config.aliasPago || "Pato.pasteleria.haedo";
    },

    get paymentHolder() {
      const config = (typeof window !== "undefined" && (window.STORE_CONFIG || window.storeInfo)) || {};
      return config.titularPago || "Pato (Pastelería Pato)";
    },

    // Copiar alias al portapapeles con feedback instantáneo
    copyAlias() {
      const alias = this.paymentAlias;
      const onCopied = () => {
        this.aliasCopied = true;
        if (typeof Toastify === "function") {
          Toastify({
            text: `¡Alias "${alias}" copiado al portapapeles!`,
            duration: 2200,
            gravity: "bottom",
            position: "center",
            style: { background: "linear-gradient(135deg, #059669 0%, #047857 100%)", borderRadius: "14px", color: "#FFFFFF" }
          }).showToast();
        }
        setTimeout(() => { this.aliasCopied = false; }, 2500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(alias).then(onCopied).catch(() => {
          this.fallbackCopy(alias, onCopied);
        });
      } else {
        this.fallbackCopy(alias, onCopied);
      }
    },

    fallbackCopy(text, callback) {
      try {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        if (callback) callback();
      } catch (e) {
        console.warn("No se pudo copiar automáticamente:", e);
      }
    },

    // Inicialización del Store
    init() {
      this.loadFromStorage();
    },

    // Carga de items desde localStorage
    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.items = parsed;
          }
        }
      } catch (err) {
        console.warn("No se pudo cargar el carrito previo:", err);
      }
    },

    // Guardado persistente
    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch (err) {
        console.warn("No se pudo guardar el carrito en almacenamiento local:", err);
      }
    },

    // Agregar producto al carrito
    addItem(product, qty = 1) {
      if (!product || !product.id) return;

      const existingIndex = this.items.findIndex(item => item.id === product.id);
      
      if (existingIndex > -1) {
        this.items[existingIndex].cantidad += qty;
      } else {
        this.items.push({
          id: product.id,
          nombre: product.nombre,
          precio: Number(product.precio) || 0,
          unidad: product.unidad || "unidad",
          imagen: product.imagen || "",
          categoria: product.categoria || "",
          cantidad: qty
        });
      }

      this.saveToStorage();
      this.notifyAdded(product, qty);
    },

    // Obtener cantidad actual de un producto
    getItemQuantity(productId) {
      const found = this.items.find(item => item.id === productId);
      return found ? found.cantidad : 0;
    },

    // Incrementar cantidad
    increaseQuantity(productId, step = 1) {
      const item = this.items.find(i => i.id === productId);
      if (item) {
        item.cantidad += step;
        this.saveToStorage();
      }
    },

    // Decrementar cantidad
    decreaseQuantity(productId, step = 1) {
      const itemIndex = this.items.findIndex(i => i.id === productId);
      if (itemIndex > -1) {
        if (this.items[itemIndex].cantidad > step) {
          this.items[itemIndex].cantidad -= step;
        } else {
          // Si llega a 0 se elimina
          this.items.splice(itemIndex, 1);
        }
        this.saveToStorage();
      }
    },

    // Quitar producto específico
    removeItem(productId) {
      const index = this.items.findIndex(i => i.id === productId);
      if (index > -1) {
        const removed = this.items.splice(index, 1)[0];
        this.saveToStorage();
        if (window.Toastify) {
          Toastify({
            text: `🗑️ ${removed.nombre} eliminado del carrito`,
            duration: 2500,
            gravity: "bottom",
            position: "right",
            style: {
              background: "linear-gradient(to right, #4B5563, #374151)",
              borderRadius: "14px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
              fontSize: "13px",
              fontWeight: "600",
              color: "#FFFFFF"
            }
          }).showToast();
        }
      }
    },

    // Vaciar todo el carrito
    clearCart() {
      this.items = [];
      localStorage.removeItem(this.storageKey);
    },

    // Cálculos computados
    get totalCount() {
      return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    },

    get uniqueCount() {
      return this.items.length;
    },

    get subtotal() {
      return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    },

    get total() {
      return this.subtotal;
    },

    // Control del Drawer Lateral
    openDrawer() {
      this.isOpen = true;
      document.body.classList.add("overflow-hidden");
    },

    closeDrawer() {
      this.isOpen = false;
      document.body.classList.remove("overflow-hidden");
    },

    toggleDrawer() {
      if (this.isOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    // Formateador de moneda en pesos argentinos
    formatPrice(amount) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
      }).format(amount);
    },

    // Notificación Toastify al agregar
    notifyAdded(product, qty) {
      if (window.Toastify) {
        const unitText = qty === 1 ? product.unidad : `${qty} ${product.unidad}`;
        Toastify({
          text: `🧁 ¡Sumaste ${product.nombre} (${unitText})!`,
          duration: 2800,
          gravity: "bottom",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
            borderRadius: "16px",
            boxShadow: "0 12px 28px -6px rgba(217, 119, 6, 0.4)",
            fontSize: "13px",
            fontWeight: "700",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.18)"
          }
        }).showToast();
      }
    },

    // Validación y armado del Ticket de WhatsApp
    generateWhatsAppLink() {
      if (this.items.length === 0) return null;

      const config = (typeof window !== "undefined" && (window.STORE_CONFIG || window.storeInfo)) || {};
      const storePhone = config.telefonoWhatsApp || "5491159665917";
      const storeName = (config.nombre || "PASTELERÍA PATO").toUpperCase();
      const storeAddress = (config.direccion && config.localidad) 
        ? `${config.direccion}, ${config.localidad}` 
        : (config.direccion || "Nervo y Lainez, Haedo, Buenos Aires");
      const storeSpot = config.direccion || "Nervo y Lainez";

      const cliente = this.customerName.trim() || "Cliente Dulce";
      const modalidad = this.deliveryType === "delivery" 
        ? "🛵 Envío a Domicilio (Haedo y zonas aledañas)" 
        : `🏪 Retiro en el Local (${storeSpot})`;
      
      const direccionTexto = this.deliveryType === "delivery" 
        ? (this.customerAddress.trim() || "A coordinar por chat") 
        : "Retiro personalmente en el local";

      let medioPago = "💵 Efectivo al recibir";
      if (this.paymentMethod === "transferencia") {
        medioPago = `📱 Transferencia Bancaria (Alias: ${this.paymentAlias})`;
      }
      if (this.paymentMethod === "mercadopago") {
        medioPago = `💳 Mercado Pago (Alias: ${this.paymentAlias})`;
      }

      // Formateo de las líneas de productos
      const detalleItems = this.items.map(item => {
        const sub = this.formatPrice(item.precio * item.cantidad);
        return `• ${item.cantidad} ${item.unidad} x ${item.nombre} (${sub})`;
      }).join("\n");

      const notasTexto = this.notes.trim() ? this.notes.trim() : "Sin observaciones adicionales";

      // Construcción del ticket estructurado
      const mensaje = [
        `🧁 *¡NUEVO PEDIDO - ${storeName}!*`,
        `--------------------------------`,
        `👤 *Cliente:* ${cliente}`,
        `📍 *Modalidad:* ${modalidad}`,
        this.deliveryType === "delivery" ? `🏠 *Dirección:* ${direccionTexto}` : null,
        `💳 *Medio de Pago:* ${medioPago}`,
        `--------------------------------`,
        `🛒 *Detalle del Pedido:*`,
        detalleItems,
        `--------------------------------`,
        `💰 *TOTAL ESTIMADO:* ${this.formatPrice(this.total)}`,
        `--------------------------------`,
        `📝 *Notas / Dedicatoria:* ${notasTexto}`,
        `📍 *Ubicación:* ${storeAddress}`,
        `\n_¡Muchas gracias por elegir Pastelería Pato en Haedo!_`
      ].filter(Boolean).join("\n");

      return `https://wa.me/${storePhone}?text=${encodeURIComponent(mensaje)}`;
    },

    // Enviar pedido: dispara animación y abre WhatsApp
    sendOrder() {
      if (this.items.length === 0) {
        alert("El carrito está vacío. Elegí tus delicias antes de confirmar.");
        return;
      }

      if (!this.customerName.trim()) {
        alert("Por favor, ingresá tu nombre para que sepamos a quién entregarle el pedido.");
        const input = document.getElementById("cart-customer-name");
        if (input) input.focus();
        return;
      }

      if (this.deliveryType === "delivery" && !this.customerAddress.trim()) {
        alert("Por favor, ingresá tu dirección para coordinar el envío en Haedo o alrededores.");
        const input = document.getElementById("cart-customer-address");
        if (input) input.focus();
        return;
      }

      // Animación Sensorial de Confetti
      if (typeof confetti === "function") {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#EC4899', '#8B5CF6', '#F43F5E', '#FBBF24']
          });
        } catch (e) {
          console.log("Confetti anim:", e);
        }
      }

      const whatsappUrl = this.generateWhatsAppLink();
      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank");
      }
    }
  });
}

// Auto-inicialización si Alpine ya está cargado o cuando emita alpine:init
if (typeof window !== "undefined") {
  if (window.Alpine) {
    setupCartStore(window.Alpine);
  } else {
    document.addEventListener("alpine:init", () => {
      setupCartStore(window.Alpine);
    });
  }
}
