/**
 * ⚙️ CONFIGURACIÓN GLOBAL DEL COMERCIO - GastroWeb Studio 360
 * 
 * Centralización de variables clave para que clonar o adaptar este sitio
 * a otra verdulería, almacén o negocio tome solo 10 segundos.
 * 
 * Al cambiar 'telefonoWhatsApp' aquí, se actualiza automáticamente en:
 * 1. Botón de WhatsApp del Header / Navegación
 * 2. Botón de WhatsApp de la Sección de Contacto
 * 3. Botones de Consulta Directa en cada tarjeta de producto
 * 4. Generación del Ticket y Confirmación de Pedidos del Carrito (Changuito)
 */

const STORE_CONFIG = {
  // 📱 NÚMERO DE WHATSAPP OFICIAL (Formato internacional, sin signos +, guiones ni espacios)
  // Argentina: 549 + código de área + número local
  telefonoWhatsApp: "5491159665917",

  // 💳 DATOS DE PAGO / ALIAS (Transferencia bancaria y Mercado Pago)
  aliasPago: "Tefy.verduleria2026",
  titularPago: "Tefy (Verdulería Tefy)",

  // 🏪 Datos de Identidad del Comercio
  nombre: "Verdulería Tefy",
  dueno: "Tefy",
  subtitulo: "Kiosco, Almacén y Verdulería de Barrio",
  eslogan: "Frescura de Verdad, Calidad y Precios del Día",
  direccion: "Guido Spano y Carrasco",
  localidad: "Villa Luzuriaga, Buenos Aires",
  horarios: "Lunes a Sábados de 8:30 a 13:30 y 16:30 a 20:30 hs",
  estadoActual: "Abierto hoy",
  cartelOriginal: "img/Screenshot_20260905_142644_WhatsApp.jpg"
};

// Exposición global dual: compatible tanto con apertura directa local (file:///) como con módulos
if (typeof window !== "undefined") {
  window.STORE_CONFIG = STORE_CONFIG;
  window.storeInfo = STORE_CONFIG; // Retrocompatibilidad garantizada con código previo
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = STORE_CONFIG;
}

export { STORE_CONFIG };
export default STORE_CONFIG;
