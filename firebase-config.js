// ==========================================
// 1. FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB_Fv9HLMOy9cCHT2cZLLwRQOGGBHA_8N0",
    authDomain: "myapp-94cf9.firebaseapp.com",
    projectId: "myapp-94cf9",
    storageBucket: "myapp-94cf9.firebasestorage.app",
    messagingSenderId: "542065139667",
    appId: "1:542065139667:web:76ed67d78188ff3e6dd926"
};
 
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();