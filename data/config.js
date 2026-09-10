/**
 * ⚙️ CONFIGURACIÓN GLOBAL DEL COMERCIO - GastroWeb Studio 360
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * Todos los derechos reservados / All Rights Reserved.
 * 
 * Centralización de variables clave para que clonar o adaptar este sitio
 * a otra pastelería, panadería o negocio gastronómico tome solo 10 segundos.
 * 
 * Al cambiar 'telefonoWhatsApp' aquí, se actualiza automáticamente en:
 * 1. Botón de WhatsApp del Header / Navegación
 * 2. Botón de WhatsApp de la Sección de Contacto
 * 3. Botones de Consulta Directa en cada tarjeta de delicia
 * 4. Generación del Ticket y Confirmación de Pedidos del Carrito Dulce
 */

const STORE_CONFIG = {
  // 📱 NÚMERO DE WHATSAPP OFICIAL (Formato internacional, sin signos +, guiones ni espacios)
  // Argentina: 549 + código de área + número local
  telefonoWhatsApp: "5491159665917",

  // 💳 DATOS DE PAGO / ALIAS (Transferencia bancaria y Mercado Pago)
  aliasPago: "Pato.pasteleria.haedo",
  titularPago: "Pato (Pastelería Pato)",

  // 🔐 PIN DE SEGURIDAD PARA ACCESO A PANEL ADMIN (admin.html)
  adminPin: "2026",

  // 🏪 Datos de Identidad del Comercio
  nombre: "Pastelería Pato",
  dueno: "Pato",
  subtitulo: "Tortas, Tartas y Delicias Artesanales",
  eslogan: "El auténtico sabor casero en cada bocado, horneado con amor",
  direccion: "Nervo y Lainez",
  localidad: "Haedo, Buenos Aires",
  horarios: "Martes a Sábados de 9:00 a 13:00 y 16:00 a 20:00 hs | Domingos de 9:30 a 13:30 hs",
  estadoActual: "Abierto hoy",
  cartelOriginal: ""
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
