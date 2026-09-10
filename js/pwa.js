/**
 * 🎂 Módulo PWA - Pastelería Pato
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * 
 * Control integral de Progressive Web App:
 * - Detección de entorno seguro y registro de Service Worker
 * - Captura del evento de instalación nativo (Chrome / Edge / Android)
 * - Modal y banner guiado universal para celulares (Android en LAN/HTTP y iPhone en Safari)
 */

let deferredPrompt = null;

// Detección de dispositivo y modo standalone (ya instalada)
const isIos = typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
const isMobile = isIos || isAndroid || (typeof window !== "undefined" && window.innerWidth < 768);
const isStandalone = typeof window !== "undefined" && (
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true ||
  document.referrer.includes("android-app://")
);

// 1. Registro del Service Worker
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Si estamos en HTTPS, localhost o 127.0.0.1
    const isSecureOrLocal = window.location.protocol === "https:" || 
                            window.location.hostname === "localhost" || 
                            window.location.hostname === "127.0.0.1";

    if (isSecureOrLocal) {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          console.log("🎂 [PWA] Service Worker registrado:", reg.scope);
        })
        .catch((err) => {
          console.warn("⚠️ [PWA] Registro de SW omitido o fallido:", err);
        });
    } else {
      console.info("ℹ️ [PWA] Acceso por HTTP en red local. Modo manual activado.");
    }
  });
}

// 2. Manejo del evento beforeinstallprompt
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("📲 [PWA] Evento beforeinstallprompt capturado.");
    showInstallButtons();
  });

  // Mostrar u ocultar botones según estado de instalación
  document.addEventListener("DOMContentLoaded", () => {
    const isAlreadyInstalled = isStandalone || (typeof localStorage !== "undefined" && localStorage.getItem("pato_pwa_installed") === "true");
    if (!isAlreadyInstalled) {
      showInstallButtons();
      setupMobileBanner();
    } else {
      hideInstallButtons();
    }
  });
}

/**
 * Muestra los botones de instalación en la interfaz
 */
function showInstallButtons() {
  const isAlreadyInstalled = isStandalone || (typeof localStorage !== "undefined" && localStorage.getItem("pato_pwa_installed") === "true");
  if (isAlreadyInstalled) {
    hideInstallButtons();
    return;
  }
  const installBtns = document.querySelectorAll(".pwa-install-btn");
  installBtns.forEach((btn) => {
    btn.classList.remove("hidden");
    btn.classList.add("inline-flex");
  });
}

/**
 * Disparador de instalación universal
 */
window.installPwa = async function () {
  // Caso 1: Prompt nativo disponible (Chrome en PC o Android HTTPS)
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Elección del usuario: ${outcome}`);
      deferredPrompt = null;
      if (outcome === "accepted") {
        hideInstallButtons();
      }
      return;
    } catch (err) {
      console.warn("Error en prompt nativo:", err);
    }
  }

  // Caso 2: Dispositivo móvil sin prompt automático (Safari iOS o Chrome en HTTP LAN)
  showInstallInstructionsModal();
};

/**
 * Oculta los botones tras instalación
 */
function hideInstallButtons() {
  const installBtns = document.querySelectorAll(".pwa-install-btn");
  installBtns.forEach((btn) => btn.classList.add("hidden"));
  const banner = document.getElementById("pwa-mobile-floating-banner");
  if (banner) banner.remove();
}

/**
 * Muestra el modal con instrucciones visuales paso a paso
 */
function showInstallInstructionsModal() {
  const existingModal = document.getElementById("pwa-instructions-modal");
  if (existingModal) {
    existingModal.classList.remove("hidden");
    existingModal.classList.add("flex");
    return;
  }

  const modal = document.createElement("div");
  modal.id = "pwa-instructions-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in";
  
  const isApple = isIos;
  const title = isApple ? "Instalar en tu iPhone / iPad" : "Instalar en tu Celular Android";
  const step1 = isApple 
    ? 'Tocá el botón <strong>Compartir</strong> (<span class="text-rose-500 font-bold">cuadrado con la flecha hacia arriba ⎋ / ↑</span>) en la barra de Safari.'
    : 'Tocá los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de Google Chrome.';
  const step2 = isApple
    ? 'Deslizá las opciones y seleccioná <strong>"Agregar a pantalla de inicio"</strong> 📲.'
    : 'Seleccioná la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong> 📲.';
  const step3 = isApple
    ? 'Tocá <strong>"Agregar"</strong> arriba a la derecha. ¡Y listo! Ya tenés el icono de Pastelería Pato en tu pantalla.'
    : 'Confirmá la instalación. ¡Listo! La app se agregará a tu pantalla junto a tus otras aplicaciones.';

  modal.innerHTML = `
    <div class="bg-[#150A0D] border border-rose-900/60 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left">
      <button onclick="document.getElementById('pwa-instructions-modal').classList.add('hidden')" 
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl p-2 rounded-full focus:outline-none">
        ✕
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-2xl shadow-lg shadow-rose-900/40">
          🎂
        </div>
        <div>
          <h3 class="font-bold text-lg text-white font-display">${title}</h3>
          <p class="text-xs text-rose-300 font-medium">Pastelería Pato • Haedo</p>
        </div>
      </div>

      <div class="space-y-3.5 text-xs text-gray-300 my-5 bg-black/40 p-4 rounded-2xl border border-white/10">
        <div class="flex items-start gap-3">
          <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
          <p>${step1}</p>
        </div>
        <div class="flex items-start gap-3">
          <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
          <p>${step2}</p>
        </div>
        <div class="flex items-start gap-3">
          <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
          <p>${step3}</p>
        </div>
      </div>

      <button onclick="window.confirmPwaInstalled()" 
              class="w-full bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-lg shadow-rose-900/40">
        ¡Listo, ya la agregué!
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

/**
 * Marca la app como agregada/instalada y oculta los elementos en pantalla
 */
window.confirmPwaInstalled = function () {
  try {
    localStorage.setItem("pato_pwa_installed", "true");
    sessionStorage.setItem("pato_pwa_banner_dismissed", "true");
  } catch (e) {}

  const modal = document.getElementById("pwa-instructions-modal");
  if (modal) modal.classList.add("hidden");

  hideInstallButtons();

  if (typeof window.Toastify === "function") {
    window.Toastify({
      text: "🎂 ¡Excelente! Accedé siempre a Pastelería Pato desde el icono de tu pantalla.",
      duration: 3500,
      gravity: "bottom",
      position: "center",
      style: {
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        borderRadius: "14px",
        color: "#FFFFFF"
      }
    }).showToast();
  }
};

/**
 * Banner flotante específico para celulares
 */
function setupMobileBanner() {
  const isAlreadyInstalled = isStandalone || (typeof localStorage !== "undefined" && localStorage.getItem("pato_pwa_installed") === "true");
  if (!isMobile || isAlreadyInstalled) return;
  if (sessionStorage.getItem("pato_pwa_banner_dismissed") === "true") return;

  const existing = document.getElementById("pwa-mobile-floating-banner");
  if (existing) return;

  const banner = document.createElement("div");
  banner.id = "pwa-mobile-floating-banner";
  banner.className = "fixed bottom-3 left-3 right-3 z-40 bg-[#150A0D]/95 border border-rose-500/40 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-2.5 transition-transform animate-slide-up sm:hidden";

  banner.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0" onclick="window.installPwa()" style="cursor: pointer;">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-lg shrink-0 shadow-md">
        🎂
      </div>
      <div class="min-w-0">
        <p class="text-xs font-bold text-white truncate">Instalar Pastelería Pato</p>
        <p class="text-[10px] text-gray-300 truncate">Accedé en 1 toque desde tu pantalla</p>
      </div>
    </div>
    <div class="flex items-center gap-1 shrink-0">
      <button onclick="window.installPwa()" class="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg shadow-sm active:scale-95">
        Instalar
      </button>
      <button onclick="dismissPwaBanner()" class="text-gray-400 hover:text-white text-base px-1.5 py-1" title="Cerrar">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(banner);
}

window.dismissPwaBanner = function () {
  const banner = document.getElementById("pwa-mobile-floating-banner");
  if (banner) {
    banner.remove();
    sessionStorage.setItem("pato_pwa_banner_dismissed", "true");
  }
};

// 4. Celebración tras instalación exitosa
if (typeof window !== "undefined") {
  window.addEventListener("appinstalled", () => {
    console.log("🎉 [PWA] Pastelería Pato instalada en el dispositivo.");
    hideInstallButtons();
    if (typeof confetti === "function") {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }
    if (typeof window.Toastify === "function") {
      window.Toastify({
        text: "🎉 ¡Pastelería Pato instalada! Ahora podés abrirla directamente desde tu pantalla de inicio.",
        duration: 5000,
        gravity: "bottom",
        position: "center",
        style: {
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          borderRadius: "14px",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.5)"
        }
      }).showToast();
    }
  });
}
