/**
 * 🔥 Configuración de Firebase Cloud Firestore (Modular SDK v10)
 * Verdulería Tefy - Catálogo y Precios en Tiempo Real
 * 
 * Se importa directamente desde el CDN oficial de Google Firebase (gstatic)
 * para compatibilidad nativa en navegadores sin necesidad de empaquetadores.
 * 
 * INSTRUCCIONES:
 * Reemplazá los valores del objeto `firebaseConfig` a continuación con las
 * credenciales de tu proyecto obtenidas desde la consola de Firebase:
 * https://console.firebase.google.com/
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

// Re-exportamos todas las funciones modulares de Firestore para que los módulos
// del proyecto puedan importarlas directamente desde "./firebase-config.js" de forma relativa.
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
  getAuth
};

// Objeto de configuración de tu proyecto en Firebase
export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

/**
 * Verifica si las credenciales fueron provistas por el usuario
 * o si aún contienen los valores de ejemplo por defecto.
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
      projectId: "demo-verduleria-tefy",
      appId: "demo-app-id"
    };

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseAppConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

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
