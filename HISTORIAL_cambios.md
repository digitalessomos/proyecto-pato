# Historial de Cambios — Pastelería Pato

Registro cronológico de modificaciones técnicas, correcciones y mejoras aplicadas en el proyecto.

---

## [2026-09-10] - Implementación de Suite de Derechos de Autor, Gobernanza y Branding

### 📌 Categoría
**Gobernanza / Propiedad Intelectual / Legal & Branding**

### 🔍 Diagnóstico del Problema
* **Ausencia de licencia propietaria:** El repositorio no contaba con un archivo de licencia explícito, generando ambigüedad sobre la titularidad y derechos del software.
* **Falta de metadatos de autoría:** Los archivos HTML carecían de etiquetas `<meta name="author">` y `<meta name="copyright">`.
* **Ausencia de memoria técnica centralizada:** No existía un archivo `GEMINI.md` propio que definiera las reglas de negocio, modelos de datos de Firestore e identidad de Pastelería Pato.

### 🛠️ Cambios Realizados
1. **Creación del archivo `LICENSE` Propietario:**
   * Se redactó la licencia formal que reserva todos los derechos a favor de **GastroWeb Studio 360** y **Pastelería Pato** (Haedo, Buenos Aires), prohibiendo la copia, reproducción, distribución o clonación no autorizada.
2. **Definición en `package.json`:**
   * Se configuraron las propiedades `"author": "GastroWeb Studio 360"` y `"license": "UNLICENSED"`.
3. **Metadatos HTML en `index.html` y `admin.html`:**
   * Se incorporaron las etiquetas `<meta name="author">` y `<meta name="copyright">`.
4. **Cabeceras de Licencia en Código Fuente:**
   * Se añadieron bloques formales de copyright en `js/app.js`, `js/productsService.js`, `js/admin.js`, `js/cart.js`, `data/config.js` y `css/styles.css`.
5. **Marcas de Agua en Consola DevTools:**
   * Se programaron avisos con estilo distintivo en consola en `app.js` y `admin.js` con advertencia legal.
6. **Actualización de Firma en el Footer:**
   * Se acreditó formalmente la titularidad en los pies de página: `© 2026 Pastelería Pato. Todos los derechos reservados. • Desarrollado por GastroWeb Studio 360`.
7. **Creación de `GEMINI.md` de Gobernanza:**
   * Se documentó la memoria técnica integral de la pastelería, modelo de datos y reglas irrompibles.

---

## [2026-09-10] - Escalabilidad de Fotos y Conexión con Firebase Storage

### 📌 Categoría
**Rendimiento / Almacenamiento en la Nube / Optimización de Cuota**

### 🔍 Diagnóstico del Problema
* **Persistencia de Base64 en Firestore y LocalStorage:** Al subir fotos desde el celular en el panel, las imágenes se guardaban como extensas cadenas `data:image/jpeg;base64,...`, saturando el límite de 5 MB de `localStorage` y disparando el consumo de ancho de banda.

### 🛠️ Cambios Realizados
1. **Integración Modular de Firebase Storage:**
   * Se agregó `"firebase/storage"` en los mapas de importación (`importmap`) de `admin.html` e `index.html`.
   * En `js/firebase-config.js`, se inicializó el servicio modular de Storage (`storage = getStorage(app)`) apuntando al bucket `pasteleriabd-a7b6b.firebasestorage.app`.
2. **Método Asíncrono de Subida en `productsService.js`:**
   * Se implementó `productsService.uploadProductImage(dataUrl, productId)` que sube la imagen a `productos/{productId}.jpg` con metadatos (`uploadedBy: "admin-pato"`).
   * Devuelve la URL pública corta (`https://firebasestorage.googleapis.com/...`).
3. **Interceptación Automática en Altas y Ediciones:**
   * En `addProduct` y `updateProduct`, cualquier imagen Base64 se envía automáticamente a Storage y en Firestore solo se persiste la URL corta.
   * En `js/admin.js`, se implementó feedback visual (`"⏳ Subiendo foto a Firebase Storage..."`).

---

## [2026-09-10] - Blindaje de Seguridad con Pantalla de Bloqueo y PIN en admin.html

### 📌 Categoría
**Seguridad y Control de Acceso / Experiencia de Usuario Móvil**

### 🔍 Diagnóstico del Problema
* **Acceso irrestricto al panel administrativo:** Cualquier persona que abriera `/admin.html` podía alterar precios, unidades o disponibilidad sin validación previa.
* **Fuga prematura de datos:** El script `admin.js` cargaba productos antes de verificar la identidad.

### 🛠️ Cambios Realizados
1. **Pantalla de Bloqueo Inmersiva (`#admin-lock-screen`):**
   * Pantalla completa con tarjeta Glassmorphism en tono oscuro (`#150A0D`), icono `🎂 / 🔒`, campo de PIN con botón ver/ocultar y mensaje de alerta.
   * Contenedor `#admin-app-root` completamente oculto (`hidden`) hasta que el usuario se autentica exitosamente.
2. **Teclado Numérico Táctil:**
   * Teclas 0-9, botón C (limpiar) y ⌫ (borrar dígito) para ingreso ágil con una mano desde el celular en el local.
3. **PIN Centralizado en `data/config.js`:**
   * Propiedad `adminPin: "2026"` en `STORE_CONFIG` (con llaves maestras `"2026"` y `"pato2026"`).
4. **Animación Shake de Seguridad:**
   * Animación CSS `@keyframes shakeAnim` y `.animate-shake` ante intentos erróneos.
5. **Persistencia de Sesión y Botón de Bloqueo:**
   * Sesión activa en `sessionStorage` (`pato_admin_authenticated`).
   * Botón `"🔒 Bloquear"` en el header del panel para cerrar la sesión inmediatamente.

---

## [2026-09-10] - Desacoplamiento de Datos (Patrón Observer) y Dinamismo de WhatsApp

### 📌 Categoría
**Desacoplamiento Arquitectónico / Reactividad Dinámica**

### 🔍 Diagnóstico del Problema
* **Enlaces estáticos de WhatsApp:** En `index.html` existían atributos `href="https://wa.me/5491159665917..."` quemados en el código.
* **Acoplamiento en `app.js`:** Importaba directamente primitivas de Firestore (`db`, `collection`, `onSnapshot`, etc.), violando la separación de capas.

### 🛠️ Cambios Realizados
1. **Enlaces de WhatsApp 100% reactivos:**
   * Se eliminaron los `href` fijos. Toda la interacción se genera vía `:href="getWhatsAppGeneralLink(...)"` enlazado a `STORE_CONFIG`.
2. **Patrón Observer en `productsService.js`:**
   * Método `subscribeToProducts({ onData, onError })` que encapsula `onSnapshot`, siembra inicial y fallback reactivo a `localStorage` (escuchando eventos `storage` y `products-updated`).
   * Función `unsubscribe()` completa para evitar fugas de memoria.
3. **Desacoplamiento total en `app.js`:**
   * Se eliminaron todas las dependencias directas de Firebase en `app.js`. Ahora consume exclusivamente `productsService.subscribeToProducts`.
   * Método `destroy()` para desmontaje limpio.

---

## [2026-09-10] - Limpieza y Saneamiento de "Grasa Técnica"

### 📌 Categoría
**Mantenibilidad / Arquitectura Serverless Ligera**

### 🔍 Diagnóstico del Problema
* En la raíz de `pasteleria-pato` convivían archivos heredados de plantillas de React (`src/App.tsx`, `src/main.tsx`, `src/index.css`, `bun.lock`, `tsconfig.json`, `vite.config.ts`).
* Existía un archivo puente duplicado `firebase-config.js` en la raíz.
* `package.json` declaraba dependencias innecesarias de React.

### 🛠️ Cambios Realizados
1. Eliminación de la carpeta `src/`, `bun.lock`, `tsconfig.json` y `vite.config.ts`.
2. Eliminación de `firebase-config.js` en la raíz, unificando la ruta oficial en `js/firebase-config.js`.
3. Limpieza de carpetas redundantes de compilaciones antiguas en `public/`.
4. Creación de `vite.config.js` minimalista configurado para servir `index.html` y `admin.html`.
5. Simplificación de `package.json` con `name: "pasteleria-pato"` y únicamente `vite` como devDependency.
