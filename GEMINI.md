# 🎂 GEMINI.md — Pastelería Pato | Memoria del Proyecto & Directivas Técnicas (Versión Firebase)

> Este archivo es la **memoria central del proyecto**. Todo desarrollador o modelo de IA que trabaje en este repositorio debe leer este documento completo antes de modificar código. Su objetivo es garantizar la integridad del negocio, la seguridad de los datos en Firebase Firestore, el resguardo optimizado de imágenes a costo $0 y la fluidez del cliente al realizar pedidos por WhatsApp.

---

## 🏪 Identidad y Datos Oficiales del Negocio

| Campo                  | Valor Oficial de Producción                                    |
|------------------------|----------------------------------------------------------------|
| **Nombre Comercial**   | Pastelería Pato                                                |
| **Tipo de Comercio**   | Pastelería, Tartas y Delicias Caseras Artesanales              |
| **Responsable / Dueña**| Pato                                                           |
| **Eslogan**            | El auténtico sabor casero en cada bocado, horneado con amor    |
| **Ubicación**          | Nervo y Lainez, Haedo, Buenos Aires, Argentina                 |
| **Horarios**           | Martes a Sábados: 9:00 a 13:00 hs y 16:00 a 20:00 hs \| Dom: 9:30 a 13:30 hs |
| **WhatsApp Oficial**   | **5491159665917** (Formato internacional, sin +, sin guiones)  |
| **Alias de Pago**      | **Pato.pasteleria.haedo** (Transferencia Bancaria y Mercado Pago)|
| **PIN de Acceso Admin**| **1122** (configurable en `data/config.js`)                    |
| **Propósito Web**      | Menú en vivo + Changuito Dulce interactivo → Pedido 1-Click WhatsApp |

---

## 🗂️ Arquitectura y Estructura del Repositorio

```text
pasteleria-pato/
├── index.html                  ← Tienda pública del cliente (HTML5 + Tailwind CDN + Alpine.js)
├── admin.html                  ← Panel de control del dueño (Vanilla JS + PIN táctil + CRUD en tiempo real)
├── firestore.rules             ← Reglas de seguridad de Cloud Firestore
├── netlify.toml                ← Configuración de hosting y redirecciones de acceso
├── LICENSE                     ← Licencia privada y propietaria (GastroWeb Studio 360 & Pastelería Pato)
├── GEMINI.md                   ← [ESTE ARCHIVO] Memoria del proyecto, reglas y directivas de IA
├── HISTORIAL_cambios.md        ← Bitácora cronológica de optimizaciones y mejoras
├── historial_pasteleria.md     ← Memoria técnica del hito de compresión Canvas y persistencia Spark $0
├── vite.config.js              ← Configuración estática minimalista para servidor local Vite
├── package.json                ← Manifiesto minimalista privado con Vite
├── css/
│   └── styles.css              ← Estilos custom (glassmorphism, hero, animaciones, shake PIN)
├── data/
│   ├── config.js               ← TOKEN ÚNICO: Datos globales del negocio (teléfono, alias, horarios, PIN)
│   └── products.js             ← Catálogo semilla de fábrica (fallback y valores predeterminados)
├── js/
│   ├── firebase-config.js      ← Credenciales e inicialización modular oficial SDK v10 (gstatic) [Plan Spark Zero-Cost]
│   ├── productsService.js      ← Capa adaptadora desacoplada (Observer, Firestore y Fallback)
│   ├── cart.js                 ← Alpine.store('cart'): Carrito global reactivo + ticket de WhatsApp
│   ├── app.js                  ← Alpine.data('pasteleriaApp'): Catálogo, filtros, slider y reactividad
│   └── admin.js                ← Lógica del panel de administración (gestión en tiempo real con PIN)
└── public/
    └── assets/                 ← Recursos estáticos del local
```

---

## ⚙️ Stack Tecnológico Oficial (Arquitectura Serverless Ligera)

| Componente         | Tecnología / Proveedor                                           | Función Principal |
|--------------------|-------------------------------------------------------------------|-------------------|
| **Estructura**     | HTML5 Semántico (`lang="es-AR"`)                                  | Marcado de tienda y panel admin |
| **Estilos**        | Tailwind CSS (Play CDN inline) + `css/styles.css`                 | UI moderna, glassmorphism, responsive móvil |
| **Frontend Tienda**| Alpine.js v3.14.3 (ESM vía jsDelivr)                             | Reactividad ligera sin compilación en el cliente |
| **Base de Datos**  | Google Firebase Cloud Firestore (Modular SDK v10 vía gstatic CDN) | Catálogo en la nube y sincronización en tiempo real |
| **Gestión de Fotos**| HTML5 Canvas (Compresión en Navegador) + Firestore Spark         | Reducción a 640px (<40 KB) a costo $0 y respuesta <50ms |
| **Panel Admin**    | JavaScript Vanilla Puro (ES Modules nativos)                     | Gestión táctil con PIN de precios y delicias |
| **Notificaciones** | Toastify JS (CDN)                                                 | Feedback visual al agregar al carrito y guardar |
| **Tipografía**     | Google Fonts (Outfit · Plus Jakarta Sans · Inter)                 | Jerarquía visual gastronómica premium |
| **Capacidades PWA** | Web App Manifest + Service Worker + Iconos Retina                 | Instalación 1-clic en Android/iOS como app nativa a costo $0 |

> 🚫 **PROHIBICIÓN ESTRICTA:** No convertir este proyecto a una SPA pesada basada en React, Angular o Next.js. La web corre directamente en el navegador sin paso de compilación obligatorio.

---

## 🔒 Regla de Oro: Datos del Negocio Centralizados

**`data/config.js` → Objeto `STORE_CONFIG`**

Cualquier cambio de número telefónico, alias de Mercado Pago, titular, dirección, horarios o PIN de acceso **DEBE realizarse exclusivamente en `data/config.js`**. 
Este objeto se propaga automáticamente a:
1. Enlace de WhatsApp de la barra de navegación.
2. Botón de WhatsApp de la sección de contacto y pie de página.
3. Botones de consulta rápida de cada delicia.
4. Generación del ticket formal de pedido en el carrito dulce.
5. Validación del PIN de acceso en `admin.html`.

```javascript
// data/config.js — NUNCA quemar estos datos en otros archivos
export const STORE_CONFIG = {
  telefonoWhatsApp: "5491159665917",
  aliasPago: "Pato.pasteleria.haedo",
  titularPago: "Pato (Pastelería Pato)",
  adminPin: "2026",
  nombre: "Pastelería Pato",
  dueno: "Pato",
  direccion: "Nervo y Lainez",
  localidad: "Haedo, Buenos Aires",
  horarios: "Martes a Sábados de 9:00 a 13:00 y 16:00 a 20:00 hs | Domingos de 9:30 a 13:30 hs"
};
```

---

## 📦 Modelo de Datos en Firestore (`/productos/{productId}`)

Los documentos en la colección `productos` respetan la siguiente estructura:

```javascript
{
  id: "rogel-artesanal",            // String único kebab-case (NUNCA cambiar tras publicarse)
  nombre: "Rogel Clásico Argentino",// String (1 a 120 caracteres)
  categoria: "tortas",              // "tortas" | "tartas" | "alfajores" | "budines"
  precio: 18500,                    // Number (pesos argentinos, entero >= 0)
  unidad: "unidad",                 // "unidad" | "porción" | "docena" | "kg" | "caja"
  imagen: "data:image/jpeg;base64,...", // Base64 comprimido (<40 KB) o URL externa HTTPS
  descripcion: "Ocho finas capas...",// String breve de presentación
  etiqueta: "Especialidad",         // Badge promocional ("La Favorita", "Imperdible", etc.)
  destacado: true,                  // Boolean (true = resalta en catálogo)
  disponible: true,                 // Boolean (false = agotado / oculto para el cliente)
  updatedAt: "2026-09-10T18:00:00Z" // Timestamp ISO de última actualización
}
```

---

## 🛡️ Capa Adaptadora Desacoplada (`js/productsService.js`)

Es el corazón de la resiliencia del proyecto:
* **Patrón Observer (`subscribeToProducts`):** `app.js` se suscribe sin importar Firestore directamente. Si hay cambios en Firestore, se reciben en vivo vía `onSnapshot`.
* **Estrategia Zero-Cost Spark de Fotos:** Las fotos tomadas desde el celular se comprimen en el cliente mediante HTML5 Canvas (640x640 px, calidad 0.75, ~25-40 KB) y se persisten directamente en el documento de Firestore, eliminando la necesidad de tarjeta de crédito en Google Cloud, erradicando bloqueos de CORS y reduciendo el tiempo de guardado a menos de 50 ms.
* **Fallback Tolerante a Fallos:** Si no hay conexión o falla Firebase, conmuta de forma transparente al `localStorage` del dispositivo (`pato_pasteleria_products_v1`) o al catálogo semilla de fábrica. **La pastelería jamás se queda en blanco ni deja de vender.**

---

## 🛒 Changuito y Ticket de Pedido (`js/cart.js`)

* **Estado Global:** Gestionado mediante `Alpine.store('cart')`.
* **Clave de Persistencia:** `"pato_pasteleria_cart_v1"`.
* **Salida de Pedido:** No procesa tarjetas ni cobra comisiones. Emite un ticket estructurado y abre directamente el chat oficial de WhatsApp de Pato (`wa.me/5491159665917`).

---

## 🚫 REGLAS IRROMPIBLES — LO QUE NUNCA SE DEBE HACER

1. **Respetar la estrategia Zero-Cost Spark de Fotos:** Las imágenes subidas desde el panel deben comprimirse siempre con Canvas antes de persistirse en Firestore (máx 500 KB según firestore.rules, estándar <40 KB). No forzar Firebase Storage ni el Plan Blaze salvo requerimiento expreso del cliente.
2. **No romper la reactividad de Alpine.js:** No manipular el DOM del catálogo (`#catalogo`) mediante `innerHTML` destructivo desde otros scripts.
3. **No quemar el teléfono de WhatsApp en el HTML:** Utilizar siempre los métodos enlazados a `STORE_CONFIG`.
4. **No reintroducir residuos de React/TypeScript/Bun:** El proyecto es Vanilla JS + Alpine.js nativo.
5. **No alterar el orden de dependencias en el `<head>`:**
   `importmap` → Tailwind CDN → Fonts/Iconos/Toastify → `styles.css` → Configuración modular.

---

*Documento de Memoria Técnica — Pastelería Pato | GastroWeb Studio 360.*
