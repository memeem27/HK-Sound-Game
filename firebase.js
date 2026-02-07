import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCcP2iVzSg2cgW7dn_3JRWIyxsuhq7aKug",
    authDomain: "hollow-knight-sound-game.firebaseapp.com",
    projectId: "hollow-knight-sound-game",
    storageBucket: "hollow-knight-sound-game.firebasestorage.app",
    messagingSenderId: "953871934333",
    appId: "1:953871934333:web:90b75a223be8215f8d2214",
    measurementId: "G-M3ZT0KJLZV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
