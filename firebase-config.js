import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvSsK3lDiJBoygWBHm2KEtKmbJ5u38NeU",
  authDomain: "bicho-d60bb.firebaseapp.com",
  projectId: "bicho-d60bb",
  storageBucket: "bicho-d60bb.firebasestorage.app",
  messagingSenderId: "816975606855",
  appId: "1:816975606855:web:8ff01b0b3e21da4b1bed62"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta para o escopo global (window) para usar nos outros arquivos
window.auth = getAuth(app);
window.db = getFirestore(app);

// Expor funções do SDK para uso global (necessário para scripts não-módulo como auth.js)
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.collection = collection;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.query = query;
window.where = where;
window.orderBy = orderBy;

console.log("🔥 Firebase Conectado!");

// Dica: Agora você pode usar window.db em vez de localStorage nos outros arquivos.
// Exemplo antigo: localStorage.setItem("usuarios", ...)
// Exemplo novo:   addDoc(collection(window.db, "usuarios"), ...)