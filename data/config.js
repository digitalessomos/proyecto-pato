/**
 * ⚙️ CONFIGURACIÓN GLOBAL DEL COMERCIO - GastroWeb Studio 360
 * 
 * Centralización de variables clave para Pastelería Pato (Haedo, Buenos Aires).
 * 
 * Al cambiar 'telefonoWhatsApp' aquí, se actualiza automáticamente en:
 * 1. Botón de WhatsApp del Header / Navegación
 * 2. Botón de WhatsApp de la Sección de Contacto
 * 3. Botones de Consulta Directa en cada tarjeta de producto
 * 4. Generación del Ticket y Confirmación de Pedidos del Carrito (Bandeja Dulce)
 */

const STORE_CONFIG = {
  // 📱 NÚMERO DE WHATSAPP OFICIAL (Formato internacional, sin signos +, guiones ni espacios)
  // Argentina: 549 + código de área + número local
  telefonoWhatsApp: "5491159665917",

  // 💳 DATOS DE PAGO / ALIAS (Ficticio para transferencia bancaria y Mercado Pago - editable por el dueño)
  aliasPago: "pasteleria.pato.mp",
  titularPago: "Pato (Pastelería Pato)",

  // 🏪 Datos de Identidad del Comercio
  nombre: "Pastelería Pato",
  dueno: "Pato",
  subtitulo: "Pastelería & Repostería Artesanal",
  eslogan: "Dulzura Artesanal, Calidad y Pasión por la Repostería",
  direccion: "Nervo y Laínez",
  localidad: "Haedo, Buenos Aires",
  horarios: "Martes a Domingos de 9:00 a 13:00 y 16:00 a 20:00 hs",
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
