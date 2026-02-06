import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

//
// ─────────────────────────────────────────────────────────────
//   AUTO‑GENERATED USERNAME SYSTEM (HOLLOW KNIGHT THEMED)
// ─────────────────────────────────────────────────────────────
//

function generateUsername() {
    const adjectives = [
        "Wandering", "Silent", "Fallen", "Radiant", "Broken", "Swift",
        "Hidden", "Eternal", "Brave", "Forgotten", "Lurking", "Shrouded",
        "Nimble", "Cursed", "Sacred", "Ancient", "Restless", "Vengeful",
        "Hollow", "Lost", "Dusky", "Gloomy", "Pale", "Shadowed"
    ];

    const nouns = [
        "Moth", "Stag", "Vessel", "Shade", "Knight", "Dreamer", "Weaver",
        "Husk", "Seeker", "Wraith", "Sentinel", "Watcher", "Tendril",
        "Beetle", "Grub", "Troupe", "Larva", "Shell", "Mask", "Soul",
        "Talisman", "Relic", "Echo", "Spirit"
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 900 + 100); // 100–999

    return `${adj}_${noun}_${num}`;
}

//
// ─────────────────────────────────────────────────────────────
//   USERNAME INITIALIZATION
// ─────────────────────────────────────────────────────────────
//

let username = localStorage.getItem("hk-username");

if (!username) {
    username = generateUsername();
    localStorage.setItem("hk-username", username);
}

const lbUsername = document.getElementById("lbUsername");
lbUsername.textContent = "User: " + username;

//
// ─────────────────────────────────────────────────────────────
//   DOM ELEMENTS
// ─────────────────────────────────────────────────────────────
//

const lbSelect = document.getElementById("lbSelect");
const lbList = document.getElementById("lbList");
const submitScoreBtn = document.getElementById("submitScoreBtn");

//
// ─────────────────────────────────────────────────────────────
//   SUBMIT CURRENT STATS TO FIREBASE
// ─────────────────────────────────────────────────────────────
//

submitScoreBtn.addEventListener("click", async () => {
    const wins = Number(document.getElementById("wins").textContent);
    const fastest = Number(document.getElementById("fastestTime").textContent);
    const streak = Number(document.getElementById("streak").textContent);

    // Mode‑specific wins stored in localStorage by your game.js
    const easy = Number(localStorage.getItem("easyModeWins") || 0);
    const medium = Number(localStorage.getItem("mediumModeWins") || 0);
    const hard = Number(localStorage.getItem("hardModeWins") || 0);

    await addDoc(collection(db, "leaderboard"), {
        username,
        wins,
        fastest,
        streak,
        easy,
        medium,
        hard,
        timestamp: Date.now()
    });

    loadLeaderboard();
});

//
// ─────────────────────────────────────────────────────────────
//   LOAD LEADERBOARD FROM FIREBASE
// ─────────────────────────────────────────────────────────────
//

async function loadLeaderboard() {
    const mode = lbSelect.value;

    const q = query(
        collection(db, "leaderboard"),
        orderBy(mode, mode === "fastest" ? "asc" : "desc")
    );

    const snapshot = await getDocs(q);

    lbList.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        const li = document.createElement("li");
        li.textContent = `${data.username} — ${data[mode]}`;
        lbList.appendChild(li);
    });
}

lbSelect.addEventListener("change", loadLeaderboard);

//
// ─────────────────────────────────────────────────────────────
//   INITIAL LOAD
// ─────────────────────────────────────────────────────────────
//

loadLeaderboard();
