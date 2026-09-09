/**
 * 🔥 Configuración de Firebase Cloud Firestore (Modular SDK v10)
 * Verdulería Tefy - Catálogo y Precios en Tiempo Real
 * 
 * Reemplazá este objeto con las credenciales de tu proyecto en Firebase Console:
 */
export { 
  firebaseConfig, 
  db, 
  app, 
  auth, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType, 
  testConnection,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  query, 
  orderBy 
} from "./js/firebase-config.js";
