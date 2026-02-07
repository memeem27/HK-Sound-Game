import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";
import { app } from "./firebase.js";

// Replace with your actual reCAPTCHA v3 site key
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LdSOGMsAAAAACWNfdIZW1S8UmceCglF0HGbcXjv'),
  isTokenAutoRefreshEnabled: true
});

export { appCheck };