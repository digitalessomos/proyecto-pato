# Historial de Cambios — Pastelería Pato

Registro cronológico de modificaciones técnicas, correcciones y mejoras aplicadas en el proyecto.

---

## [2026-09-10] - Acceso Secreto VIP "Easter Egg" en Footer con PIN `1122` (`index.html` → `admin.html`)

### 📌 Categoría
**Experiencia de Usuario Premium / Seguridad por Ocultamiento / Microinteracciones & Easter Eggs**

### 🔍 Diagnóstico & Requerimiento
* **Acceso camuflado y exclusivo para el dueño:** Se requería una vía de acceso oculta para Pato desde la misma tienda pública sin que los clientes convencionales vean botones administrativos.
* **Mecanismo:** Doble clic (o doble tap en celulares) sobre la identidad "PASTELERÍA PATO" en el pie de página, abriendo una ventana modal con el mensaje personalizado *"¿Hey Pato Bro deseas acceder al panel?"* y solicitud de clave `"1122"`.

### 🛠️ Cambios Realizados
1. **Trigger Táctil y de Doble Clic:**
   * Se configuraron los eventos `@dblclick="openSecretAccess()"` y `@click="handleSecretFooterTap()"` (con detección de doble tap <450ms) en el contenedor de marca del footer en `index.html`.
2. **Modal Flotante de Lujo (Glassmorphism):**
   * Integración de tarjeta oscura con borde de neón frambuesa (`border-rose-500/40`), desenfoque de fondo (`backdrop-blur-md`), badge `"Acceso Reservado • Modo Dueña"`, campo numérico con autoenfoque y efecto `animate-shake` ante errores.
3. **Autenticación Inmediata y Transición Fluida:**
   * Al validar `"1122"`, se persiste `sessionStorage.setItem("pato_admin_authenticated", "true")`, se detona confeti festivo y se redirige a `admin.html` ya completamente desbloqueado en menos de 700 ms.
4. **Sincronización Global de PIN:**
   * Actualización de `adminPin: "1122"` en `data/config.js`, `GEMINI.md` y soporte en `js/admin.js`.

---

## [2026-09-10] - Desacoplamiento Visual de Accesos Administrativos en la Tienda Pública (`index.html`)

### 📌 Categoría
**Seguridad por Ocultamiento / Experiencia de Usuario (Cliente) / Arquitectura de Frontend**

### 🔍 Diagnóstico
* **Exposición innecesaria del panel administrativo a clientes:** `index.html` contenía 4 puntos directos de acceso visible a `admin.html` (barra superior de anuncios, barra de navegación principal, llamada a la acción en el Hero y enlaces del pie de página), además de referencias a "panel de administración" en las metaetiquetas SEO (`description` y `og:description`).
* **Enfoque de cliente:** La tienda pública (`index.html`) está destinada exclusivamente a compradores y comensales que consultan delicias y realizan pedidos por WhatsApp. El panel del dueño (`admin.html`) debe mantenerse reservado para uso interno.

### 🛠️ Cambios Realizados
1. **Limpieza de Barra Superior (`Topbar`):**
   * Se eliminó el enlace `⚙️ Panel Dueño` y el separador en la franja informativa superior.
2. **Depuración del Menú de Navegación (`Header`):**
   * Se removió el botón flotante ámbar `⚙️ Admin` junto a los botones de Carrito y WhatsApp.
3. **Optimización del Hero Principal:**
   * Se sustituyó el botón secundario `⚙️ Panel del Dueño` por una llamada a la acción enfocada al cliente: `👩‍🍳 Conocer a Pato` (con navegación suave a la sección de historia y taller `#el-puesto`), preservando el balance visual de 2 botones.
4. **Limpieza del Pie de Página (`Footer`):**
   * Se retiró el enlace directo `⚙️ Panel Dueño (admin.html)` de la barra inferior de créditos.
5. **Depuración de Metadatos SEO y Open Graph:**
   * Se eliminaron las menciones a "panel de administración" en `<meta name="description">` y `<meta property="og:description">`.

---

## [2026-09-10] - Implementación de Capacidades PWA e Instalación Nativa en Android / iOS

### 📌 Categoría
**Mobile First / Progressive Web App (PWA) / Experiencia de Usuario & Retención**

### 🔍 Diagnóstico de Oportunidad
* **Fricción de acceso desde el mostrador y para clientes recurrentes:** Pato y los clientes debían abrir el navegador, tipear la URL o buscar en pestañas para entrar al menú o al panel administrativo.
* **Falta de soporte como aplicación instalable:** No existía `manifest.json`, iconos adaptativos de alta resolución ni Service Worker para calificar como PWA instalable en Android, iOS o Windows.

### 🛠️ Cambios Realizados
1. **Generación de Iconos Retina Adaptativos y Maskable:**
   * Creación de `public/assets/icon-192.png`, `public/assets/icon-512.png` y `public/assets/icon-maskable-512.png` con identidad de Pastelería Pato (paleta frambuesa `#4C0519`, acento dorado `#F59E0B` y fondo adaptativo seguro para Android).
2. **Creación del Manifiesto Oficial (`manifest.json`):**
   * Configuración de modo `display: standalone` (sin barra de navegador), orientación vertical, colores de tema (`theme_color: #4C0519`, `background_color: #FAF6F5`), rutas absolutas de inicio (`start_url: "/index.html"`, `scope: "/"` para evitar referencias anidadas a `/assets/`) y accesos directos (*shortcuts*) al catálogo y al panel admin.
3. **Desarrollo de Service Worker Ultraligero (`sw.js`):**
   * Pre-cacheo de recursos estáticos clave (CSS, JS, iconos), estrategia Stale-While-Revalidate para assets y Network-First para navegación, con bypass total a peticiones de Firestore en tiempo real para no afectar la frescura de los datos.
4. **Módulo de Control y Eventos (`js/pwa.js`):**
   * Registro transparente del Service Worker, captura del evento `beforeinstallprompt`, soporte de instalación en iPhone/Safari y celebración con confeti ante instalación exitosa.
5. **Tarjeta Permanente de Instalación en el Footer:**
   * Reubicación limpia y elegante del acceso a instalación en el pie de página (`footer`) de `index.html` y `admin.html`, eliminando banners flotantes invasivos y garantizando disponibilidad continua tanto para móviles como computadoras de escritorio.

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
