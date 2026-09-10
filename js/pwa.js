/**
 * 🎂 Módulo PWA - Pastelería Pato
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * 
 * Gestiona el registro del Service Worker y el disparador de instalación en Android, iOS y Escritorio.
 */

let deferredPrompt = null;

// 1. Registrar Service Worker
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Solo registrar si el protocolo es https o localhost
    if (window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          console.log("🎂 [PWA] Service Worker registrado con éxito:", reg.scope);
        })
        .catch((err) => {
          console.warn("⚠️ [PWA] Error al registrar Service Worker:", err);
        });
    }
  });
}

// 2. Capturar evento de instalación nativa de Android / Chrome
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevenir el banner automático intrusivo
    e.preventDefault();
    deferredPrompt = e;

    // Mostrar botones de instalación con la clase .pwa-install-btn
    const installBtns = document.querySelectorAll(".pwa-install-btn");
    installBtns.forEach((btn) => {
      btn.classList.remove("hidden");
      btn.classList.add("inline-flex");
    });

    console.log("📲 [PWA] Evento de instalación listo y disponible.");
  });

  // 3. Función global para disparar la instalación
  window.installPwa = async function () {
    if (!deferredPrompt) {
      if (typeof window.Toastify === "function") {
        window.Toastify({
          text: "📲 Para instalar en iPhone: Tocá Compartir (↑) y luego 'Agregar a pantalla de inicio'.",
          duration: 4000,
          gravity: "bottom",
          position: "center",
          style: {
            background: "linear-gradient(135deg, #BE123C 0%, #4C0519 100%)",
            borderRadius: "14px",
            color: "#FFFFFF"
          }
        }).showToast();
      } else {
        alert("Para instalar: Tocá el menú del navegador (tres puntos o compartir) y elegí 'Agregar a la pantalla principal'.");
      }
      return;
    }

    // Mostrar el diálogo de instalación nativo
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Respuesta de instalación del usuario: ${outcome}`);
    deferredPrompt = null;

    // Ocultar botones tras la decisión
    const installBtns = document.querySelectorAll(".pwa-install-btn");
    installBtns.forEach((btn) => btn.classList.add("hidden"));
  };

  // 4. Celebración tras instalación exitosa
  window.addEventListener("appinstalled", () => {
    console.log("🎉 [PWA] Pastelería Pato instalada en el dispositivo.");
    if (typeof confetti === "function") {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    if (typeof window.Toastify === "function") {
      window.Toastify({
        text: "🎉 ¡Pastelería Pato se instaló en tu dispositivo! Ahora podés abrirla desde tu pantalla de inicio.",
        duration: 4000,
        gravity: "bottom",
        position: "center",
        style: {
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          borderRadius: "14px",
          color: "#FFFFFF"
        }
      }).showToast();
    }
  });
}
