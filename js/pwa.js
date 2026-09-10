/**
 * 🎂 Módulo PWA - Pastelería Pato
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * 
 * Control de instalación PWA:
 * - Registro de Service Worker
 * - Captura del evento beforeinstallprompt nativo
 * - Modal instructivo universal para celulares (Android en LAN y iPhone en Safari)
 * - Botones siempre disponibles en el pie de página (footer)
 */

let deferredPrompt = null;

const isIos = typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

// 1. Registro del Service Worker
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const isSecureOrLocal = window.location.protocol === "https:" || 
                            window.location.hostname === "localhost" || 
                            window.location.hostname === "127.0.0.1";

    if (isSecureOrLocal) {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          console.log("🎂 [PWA] Service Worker registrado con alcance:", reg.scope);
        })
        .catch((err) => {
          console.warn("⚠️ [PWA] Registro de Service Worker omitido:", err);
        });
    }
  });
}

// 2. Capturar evento nativo de instalación
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("📲 [PWA] Evento nativo de instalación disponible.");
  });
}

/**
 * Disparador universal de instalación
 */
window.installPwa = async function () {
  // Caso 1: Prompt nativo disponible (Chrome en PC o Android HTTPS)
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Respuesta del usuario: ${outcome}`);
      deferredPrompt = null;
      return;
    } catch (err) {
      console.warn("Error en prompt nativo:", err);
    }
  }

  // Caso 2: Asistente guiado (Safari en iPhone o Chrome en HTTP de red local)
  showInstallInstructionsModal();
};

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
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in";
  
  const isApple = isIos;
  const title = isApple ? "Instalar en tu iPhone / iPad" : "Instalar en tu Celular Android";
  const step1 = isApple 
    ? 'Tocá el botón <strong>Compartir</strong> (<span class="text-rose-400 font-bold">cuadrado con la flecha hacia arriba ⎋ / ↑</span>) en la barra de Safari.'
    : 'Tocá los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de Google Chrome.';
  const step2 = isApple
    ? 'Deslizá las opciones y seleccioná <strong>"Agregar a pantalla de inicio"</strong> 📲.'
    : 'Seleccioná la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong> 📲.';
  const step3 = isApple
    ? 'Tocá <strong>"Agregar"</strong> arriba a la derecha. ¡Listo! Ya tenés el icono oficial en tu pantalla.'
    : 'Confirmá la instalación. ¡Listo! La app se agregará a tu pantalla con el logo de Pastelería Pato.';

  modal.innerHTML = `
    <div class="bg-[#150A0D] border border-rose-900/80 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left">
      <button onclick="document.getElementById('pwa-instructions-modal').classList.add('hidden')" 
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl p-2 rounded-full focus:outline-none"
              title="Cerrar">
        ✕
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-2xl shadow-lg shadow-rose-900/40 shrink-0">
          🎂
        </div>
        <div>
          <h3 class="font-bold text-base text-white font-display leading-tight">${title}</h3>
          <p class="text-xs text-rose-300 font-medium">Pastelería Pato • Haedo</p>
        </div>
      </div>

      <div class="space-y-3 text-xs text-gray-300 my-4 bg-black/50 p-4 rounded-2xl border border-white/10">
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
          <p>${step1}</p>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
          <p>${step2}</p>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
          <p>${step3}</p>
        </div>
      </div>

      <button onclick="document.getElementById('pwa-instructions-modal').classList.add('hidden')" 
              class="w-full bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-lg shadow-rose-900/40">
        ¡Entendido!
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// 3. Celebración tras instalación exitosa
if (typeof window !== "undefined") {
  window.addEventListener("appinstalled", () => {
    console.log("🎉 [PWA] Pastelería Pato instalada en el dispositivo.");
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
