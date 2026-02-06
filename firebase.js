<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCcP2iVzSg2cgW7dn_3JRWIyxsuhq7aKug",
    authDomain: "hollow-knight-sound-game.firebaseapp.com",
    projectId: "hollow-knight-sound-game",
    storageBucket: "hollow-knight-sound-game.firebasestorage.app",
    messagingSenderId: "953871934333",
    appId: "1:953871934333:web:90b75a223be8215f8d2214",
    measurementId: "G-M3ZT0KJLZV"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>