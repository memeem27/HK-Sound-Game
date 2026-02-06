/* -----------------------------
   USERNAME GENERATION
------------------------------ */

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

function randomUsernameBase() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${adj} ${noun} ${num}`;
}


/* -----------------------------
   LEADERBOARD STORAGE
------------------------------ */

const MAX_ENTRIES = 25;

let leaderboardWins = JSON.parse(localStorage.getItem("leaderboardWins") || "[]");
let leaderboardFastest = JSON.parse(localStorage.getItem("leaderboardFastest") || "[]");
let leaderboardStreak = JSON.parse(localStorage.getItem("leaderboardStreak") || "[]");
let leaderboardEasy = JSON.parse(localStorage.getItem("leaderboardEasy") || "[]");
let leaderboardMedium = JSON.parse(localStorage.getItem("leaderboardMedium") || "[]");
let leaderboardHard = JSON.parse(localStorage.getItem("leaderboardHard") || "[]");

const lbSelect = document.getElementById("lbSelect");
const lbListEl = document.getElementById("lbList");


function allUsernamesInLeaderboards() {
    const all = [];
    [leaderboardWins, leaderboardFastest, leaderboardStreak,
     leaderboardEasy, leaderboardMedium, leaderboardHard].forEach(lb => {
        lb.forEach(entry => all.push(entry.user));
    });
    return all;
}

function ensureUsername() {
    if (username) return;
    const existing = new Set(allUsernamesInLeaderboards());
    let candidate = randomUsernameBase();
    while (existing.has(candidate)) {
        candidate = randomUsernameBase();
    }
    username = candidate;
    localStorage.setItem("username", username);
}

function saveLeaderboards() {
    localStorage.setItem("leaderboardWins", JSON.stringify(leaderboardWins));
    localStorage.setItem("leaderboardFastest", JSON.stringify(leaderboardFastest));
    localStorage.setItem("leaderboardStreak", JSON.stringify(leaderboardStreak));
    localStorage.setItem("leaderboardEasy", JSON.stringify(leaderboardEasy));
    localStorage.setItem("leaderboardMedium", JSON.stringify(leaderboardMedium));
    localStorage.setItem("leaderboardHard", JSON.stringify(leaderboardHard));
}


/* -----------------------------
   RENDER LEADERBOARD
------------------------------ */

function renderCurrentLeaderboard() {
    lbListEl.innerHTML = "";
    const type = lbSelect.value;
    let list = [];
    let formatter = () => "";

    if (type === "wins") {
        list = leaderboardWins;
        formatter = e => `${e.user} – ${e.wins}`;
    } else if (type === "fastest") {
        list = leaderboardFastest;
        formatter = e => `${e.user} – ${e.time.toFixed(2)}s`;
    } else if (type === "streak") {
        list = leaderboardStreak;
        formatter = e => `${e.user} – ${e.streak}`;
    } else if (type === "easy") {
        list = leaderboardEasy;
        formatter = e => `${e.user} – ${e.score}`;
    } else if (type === "medium") {
        list = leaderboardMedium;
        formatter = e => `${e.user} – ${e.score}`;
    } else if (type === "hard") {
        list = leaderboardHard;
        formatter = e => `${e.user} – ${e.score}`;
    }

    if (!list.length) {
        const li = document.createElement("li");
        li.className = "lb-empty";
        li.textContent = "N/A";
        lbListEl.appendChild(li);
        return;
    }

    list.slice(0, MAX_ENTRIES).forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${formatter(entry)}`;
        lbListEl.appendChild(li);
    });
}

lbSelect.onchange = () => {
    renderCurrentLeaderboard();
};


/* -----------------------------
   TROPHY SYSTEM
------------------------------ */

const trophyCase = document.getElementById("trophyCase");

function getTopUser(lb, key, ascending = false) {
    if (!lb.length) return null;
    const sorted = [...lb].sort((a, b) => ascending ? a[key] - b[key] : b[key] - a[key]);
    return sorted[0];
}

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

            <!-- Android-style geometric trophy -->
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

function updateTrophies() {
    trophyCase.innerHTML = "";
    if (!username) return;

    const trophies = [];

    const topWins = getTopUser(leaderboardWins, "wins", false);
    if (topWins && topWins.user === username) {
        trophies.push({
            colors: ["#fff7d1", "#f2b93b", "#c47a1f"],
            cls: "trophy-wins",
            title: "#1 in Wins"
        });
    }

    const topFastest = getTopUser(leaderboardFastest, "time", true);
    if (topFastest && topFastest.user === username) {
        trophies.push({
            colors: ["#ffffff", "#d0eaff", "#9ad7ff"],
            cls: "trophy-fastest",
            title: "#1 Fastest Time"
        });
    }

    const topStreak = getTopUser(leaderboardStreak, "streak", false);
    if (topStreak && topStreak.user === username) {
        trophies.push({
            colors: ["#f0d4ff", "#c28bff", "#8b4dff"],
            cls: "trophy-streak",
            title: "#1 Best Streak"
        });
    }

    const topEasy = getTopUser(leaderboardEasy, "score", false);
    if (topEasy && topEasy.user === username) {
        trophies.push({
            colors: ["#d4f6ff", "#6ad7ff", "#2a9fff"],
            cls: "trophy-easy",
            title: "#1 Easy Mode Score"
        });
    }

    const topMedium = getTopUser(leaderboardMedium, "score", false);
    if (topMedium && topMedium.user === username) {
        trophies.push({
            colors: ["#ffd4d4", "#ff6a6a", "#c43a3a"],
            cls: "trophy-medium",
            title: "#1 Medium Mode Score"
        });
    }

    const topHard = getTopUser(leaderboardHard, "score", false);
    if (topHard && topHard.user === username) {
        trophies.push({
            colors: ["#ffffff", "#777777", "#000000"],
            cls: "trophy-hard",
            title: "#1 Hard Mode Score"
        });
    }

    trophies.forEach((t, index) => {
        const gradId = `trophyGrad_${index}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        const trophyEl = createTrophySVG(gradId, t.colors, t.cls, t.title);
        trophyCase.appendChild(trophyEl);
    });
}


/* -----------------------------
   SUBMIT SCORE BUTTON
------------------------------ */

const submitScoreBtn = document.getElementById("submitScoreBtn");

function upsertEntry(list, matchKey, matchValue, data, sortKey, ascending = false) {
    const existingIndex = list.findIndex(e => e[matchKey] === matchValue);
    if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...data };
    } else {
        list.push({ [matchKey]: matchValue, ...data });
    }
    list.sort((a, b) => ascending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
    if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
}

submitScoreBtn.onclick = () => {
    ensureUsername();

    upsertEntry(leaderboardWins, "user", username, { wins }, "wins", false);

    if (fastestTime > 0) {
        upsertEntry(leaderboardFastest, "user", username, { time: fastestTime }, "time", true);
    }

    upsertEntry(leaderboardStreak, "user", username, { streak: bestStreak }, "streak", false);

    if (timerMode === "easy") {
        upsertEntry(leaderboardEasy, "user", username, { score: roundsCompleted }, "score", false);
    } else if (timerMode === "medium") {
        upsertEntry(leaderboardMedium, "user", username, { score: roundsCompleted }, "score", false);
    } else if (timerMode === "hard") {
        upsertEntry(leaderboardHard, "user", username, { score: roundsCompleted }, "score", false);
    }

    saveLeaderboards();
    renderCurrentLeaderboard();
    updateTrophies();
    updateUsernameDisplay();
};

function updateUsernameDisplay() {
    ensureUsername();
    lbUsernameEl.textContent = "Your Username: " + username;
}


/* -----------------------------
   INITIALIZE
------------------------------ */

ensureUsername();
updateUsernameDisplay();
renderCurrentLeaderboard();
updateTrophies();
