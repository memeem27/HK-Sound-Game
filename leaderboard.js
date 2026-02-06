import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

// DOM elements
const lbSelect = document.getElementById("lbSelect");
const lbList = document.getElementById("lbList");
const submitScoreBtn = document.getElementById("submitScoreBtn");
const lbUsername = document.getElementById("lbUsername");

// Load username or ask for one
let username = localStorage.getItem("hk-username");
if (!username) {
    username = prompt("Enter a username for the leaderboard:");
    localStorage.setItem("hk-username", username);
}
lbUsername.textContent = "User: " + username;

// Submit current stats
submitScoreBtn.addEventListener("click", async () => {
    const wins = Number(document.getElementById("wins").textContent);
    const fastest = Number(document.getElementById("fastestTime").textContent);
    const streak = Number(document.getElementById("streak").textContent);

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

// Load leaderboard
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

// Load on startup
loadLeaderboard();
