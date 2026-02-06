/* ---------------------------------------------------------
   FIREBASE IMPORTS
--------------------------------------------------------- */

import { db } from "./firebase.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ---------------------------------------------------------
   USERNAME SYSTEM
--------------------------------------------------------- */

const lbUsernameEl = document.getElementById("lbUsername");
let username = localStorage.getItem("username") || "";

const adjectives = [
    "Pale","Void","Abyssal","Radiant","Grimm","Broken","Pure","Hollow","Dreaming","Silent",
    "Shrouded","Blighted","Eternal","Fallen","Forgotten","Infected","Lifeless","Sacred","Ancient",
    "Lost","Wandering","Feral","Nailbound","Soulforged","Deeproot","Umbral","Gloomed","Tattered","Vengeful"
];

const nouns = [
    "Knight","Vessel","Shade","Wraith","Mantis","Seeker","Dreamer","Monarch","Husk","Troupe","Sentinel",
    "Weaver","Stag","Watcher","Beast","Mender","Oracle","Mawlek","Golem","Carver","Shaman","Tendril",
    "Mireling","Lurker","Stalker","Guardian","Harvester","Shellwalker","Soulcatcher"
];

function randomUsername() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${adj} ${noun} ${num}`;
}

async function ensureUsername() {
    if (username) return username;

    let candidate = randomUsername();
    let exists = true;

    while (exists) {
        const docRef = doc(db, "usernames", candidate);
        const snap = await getDoc(docRef);
        exists = snap.exists();
        if (exists) candidate = randomUsername();
    }

    await setDoc(doc(db, "usernames", candidate), { created: Date.now() });

    username = candidate;
    localStorage.setItem("username", username);
    return username;
}

function updateUsernameDisplay() {
    lbUsernameEl.textContent = "Your Username: " + username;
}

/* ---------------------------------------------------------
   FIRESTORE COLLECTIONS
--------------------------------------------------------- */

const LB = {
    wins: collection(db, "leaderboard_wins"),
    fastest: collection(db, "leaderboard_fastest"),
    streak: collection(db, "leaderboard_streak"),
    easy: collection(db, "leaderboard_easy"),
    medium: collection(db, "leaderboard_medium"),
    hard: collection(db, "leaderboard_hard")
};

/* ---------------------------------------------------------
   SAVE SCORE TO FIRESTORE
--------------------------------------------------------- */

async function submitScore(category, data) {
    const user = await ensureUsername();
    const docRef = doc(LB[category], user);
    await setDoc(docRef, data, { merge: true });
}

/* ---------------------------------------------------------
   LOAD LEADERBOARD FROM FIRESTORE
--------------------------------------------------------- */

const lbSelect = document.getElementById("lbSelect");
const lbListEl = document.getElementById("lbList");

async function loadLeaderboard(category) {
    lbListEl.innerHTML = "";

    let sortField = "value";
    let ascending = false;

    if (category === "fastest") ascending = true;

    const q = query(
        LB[category],
        orderBy(sortField, ascending ? "asc" : "desc"),
        limit(25)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
        const li = document.createElement("li");
        li.className = "lb-empty";
        li.textContent = "N/A";
        lbListEl.appendChild(li);
        return;
    }

    let index = 1;
    snap.forEach(docSnap => {
        const data = docSnap.data();
        const li = document.createElement("li");

        let displayValue = data.value;
        if (category === "fastest") displayValue = data.value.toFixed(2) + "s";

        li.textContent = `${index}. ${docSnap.id} – ${displayValue}`;
        lbListEl.appendChild(li);
        index++;
    });
}

lbSelect.onchange = () => loadLeaderboard(lbSelect.value);

/* ---------------------------------------------------------
   TROPHY SYSTEM
--------------------------------------------------------- */

const trophyCase = document.getElementById("trophyCase");

function createTrophySVG(gradientId, colors, cls, title) {
    const wrapper = document.createElement("div");
    wrapper.className = `trophy ${cls}`;
    wrapper.title = title;

    wrapper.innerHTML = `
        <svg viewBox="0 0 64 64" width="22" height="22">
            <defs>
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${colors[0]}"/>
                    <stop offset="50%" stop-color="${colors[1]}"/>
                    <stop offset="100%" stop-color="${colors[2]}"/>
                </linearGradient>
            </defs>

            <path fill="url(#${gradientId})" d="M18 10h28v14c0 9.5-7.5 17-17 17s-17-7.5-17-17V10h6z"/>
            <path fill="url(#${gradientId})" d="M46 10h8v10c0 7-5 13-12 14v-6c2.5-1.5 4-4.2 4-8V10z"/>
            <path fill="url(#${gradientId})" d="M10 10h8v10c0 3.8 1.5 6.5 4 8v6C15 33 10 27 10 20V10z"/>
            <rect x="26" y="37" width="12" height="8" rx="2" ry="2" fill="#b58a3a"/>
            <rect x="22" y="47" width="20" height="4" fill="#8b5a2b"/>
            <rect x="18" y="51" width="28" height="6" fill="#c48a3a"/>
        </svg>
    `;

    return wrapper;
}

async function updateTrophies() {
    trophyCase.innerHTML = "";
    const user = await ensureUsername();

    const categories = [
        { key: "wins", title: "#1 in Wins", colors: ["#fff7d1","#f2b93b","#c47a1f"], asc: false },
        { key: "fastest", title: "#1 Fastest Time", colors: ["#ffffff","#d0eaff","#9ad7ff"], asc: true },
        { key: "streak", title: "#1 Best Streak", colors: ["#f0d4ff","#c28bff","#8b4dff"], asc: false },
        { key: "easy", title: "#1 Easy Mode Score", colors: ["#d4f6ff","#6ad7ff","#2a9fff"], asc: false },
        { key: "medium", title: "#1 Medium Mode Score", colors: ["#ffd4d4","#ff6a6a","#c43a3a"], asc: false },
        { key: "hard", title: "#1 Hard Mode Score", colors: ["#ffffff","#777777","#000000"], asc: false }
    ];

    for (let i = 0; i < categories.length; i++) {
        const c = categories[i];

        const q = query(
            LB[c.key],
            orderBy("value", c.asc ? "asc" : "desc"),
            limit(1)
        );

        const snap = await getDocs(q);
        if (!snap.empty) {
            const top = snap.docs[0];
            if (top.id === user) {
                const gradId = `grad_${c.key}_${Date.now()}`;
                const trophy = createTrophySVG(gradId, c.colors, c.key, c.title);
                trophyCase.appendChild(trophy);
            }
        }
    }
}

/* ---------------------------------------------------------
   SUBMIT SCORE BUTTON
--------------------------------------------------------- */

const submitScoreBtn = document.getElementById("submitScoreBtn");

submitScoreBtn.onclick = async () => {
    await ensureUsername();

    // Pull stats from game.js (global variables)
    await submitScore("wins", { value: wins });
    if (fastestTime > 0) await submitScore("fastest", { value: fastestTime });
    await submitScore("streak", { value: bestStreak });

    if (timerMode === "easy") await submitScore("easy", { value: roundsCompleted });
    if (timerMode === "medium") await submitScore("medium", { value: roundsCompleted });
    if (timerMode === "hard") await submitScore("hard", { value: roundsCompleted });

    await loadLeaderboard(lbSelect.value);
    await updateTrophies();
    updateUsernameDisplay();
};

/* ---------------------------------------------------------
   INITIALIZE
--------------------------------------------------------- */

(async () => {
    await ensureUsername();
    updateUsernameDisplay();
    await loadLeaderboard(lbSelect.value);
    await updateTrophies();
})();
