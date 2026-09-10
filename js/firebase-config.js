/**
 * 🎂 Configuración de Firebase Cloud Firestore y Firebase Storage (Modular SDK v10)
 * Pastelería Pato - Catálogo y Precios en Tiempo Real
 * © 2026 GastroWeb Studio 360 & Pastelería Pato.
 * Todos los derechos reservados / All Rights Reserved.
 * 
 * Se importa directamente desde el CDN oficial de Google Firebase (gstatic)
 * para compatibilidad nativa en navegadores sin necesidad de empaquetadores.
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadString,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// Re-exportamos todas las funciones modulares para que los módulos
// del proyecto puedan importarlas directamente de forma relativa.
export {
  initializeApp,
  getApps,
  getApp,
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  getAuth,
  getStorage,
  storageRef,
  uploadString,
  uploadBytes,
  getDownloadURL
};

// Objeto de configuración oficial de Pastelería Pato en Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyABfxc8ro13VetgNfRIrn_g4-yMP_L_jYc",
  authDomain: "pasteleriabd-a7b6b.firebaseapp.com",
  projectId: "pasteleriabd-a7b6b",
  storageBucket: "pasteleriabd-a7b6b.firebasestorage.app",
  messagingSenderId: "253581856298",
  appId: "1:253581856298:web:5d0cd9928f93ac32323d53"
};

/**
 * Verifica si las credenciales fueron provistas por el usuario
 * o si aún contienen valores por defecto de demostración.
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("TU_API_KEY") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("TU_PROJECT_ID")
  );
}

// Inicialización de la aplicación Firebase (Singleton)
const firebaseAppConfig = isFirebaseConfigured()
  ? firebaseConfig
  : {
    apiKey: "demo-dummy-key-for-initialization",
    projectId: "demo-pasteleria-pato",
    appId: "demo-app-id"
  };

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAppConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Desactivado para Plan Spark 100% Gratuito (evita requerimiento de tarjeta y errores de CORS)
export const storage = null;

// Tipos de operaciones para auditoría y reporte de errores
export const OperationType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LIST: "list",
  GET: "get",
  WRITE: "write"
};

/**
 * Manejador estándar de errores de Firestore
 */
export function handleFirestoreError(error, operationType, path) {
  const currentAuth = auth || null;
  const user = currentAuth?.currentUser || null;
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid || null,
      email: user?.email || null,
      emailVerified: user?.emailVerified || null,
      isAnonymous: user?.isAnonymous || null,
      tenantId: user?.tenantId || null,
      providerInfo: user?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path: path || null
  };
  console.error("🔥 [Firestore Error]:", JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Prueba la conectividad con el servidor Firestore
 */
export async function testConnection() {
  if (!isFirebaseConfigured()) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("✅ Conexión con Firebase Firestore establecida.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("⚠️ Cliente Firestore fuera de línea. Verificá tu conexión a internet o credenciales.");
    }
    return false;
  }
}
