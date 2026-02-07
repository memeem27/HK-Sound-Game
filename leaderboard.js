import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    where,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

// Rate limiting
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 10000; // 10 seconds

// Loading state
let isLeaderboardLoaded = false;

// Username sanitization
function sanitizeUsername(username) {
    if (!username || typeof username !== 'string') {
        return 'Unknown_Player_' + Math.floor(Math.random() * 1000);
    }
    // Remove special characters, keep only alphanumeric and underscore
    return username.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 50);
}

// Validate numeric stat
function validateNumber(value, min = 0, max = 999999) {
    const num = Number(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
}

document.addEventListener("DOMContentLoaded", () => {
    // Username generator
    function generateUsername() {
        const adjectives = [
            "Wandering","Silent","Fallen","Radiant","Broken","Swift",
            "Hidden","Eternal","Brave","Forgotten","Lurking","Shrouded",
            "Nimble","Cursed","Sacred","Ancient","Restless","Vengeful",
            "Hollow","Lost","Dusky","Gloomy","Pale","Shadowed"
        ];
        const nouns = [
            "Moth","Stag","Vessel","Shade","Knight","Dreamer","Weaver",
            "Husk","Seeker","Wraith","Sentinel","Watcher","Tendril",
            "Beetle","Grub","Troupe","Larva","Shell","Mask","Soul",
            "Talisman","Relic","Echo","Spirit"
        ];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 900 + 100);
        return `${adj}_${noun}_${num}`;
    }

    let username = localStorage.getItem("hk-username");
    if (!username) {
        username = generateUsername();
        localStorage.setItem("hk-username", username);
    }
    
    // Sanitize existing username
    username = sanitizeUsername(username);
    localStorage.setItem("hk-username", username);
    
    document.getElementById("lbUsername").textContent = "User: " + username;

    const lbSelect = document.getElementById("lbSelect");
    const lbList = document.getElementById("lbList");
    const submitScoreBtn = document.getElementById("submitScoreBtn");

    // Disable submit button initially
    submitScoreBtn.disabled = true;
    submitScoreBtn.textContent = "Loading...";

    // Trophy display
    const trophyCase = document.getElementById("trophyCase");

    // Trophy colors for each category
    const trophyColors = {
        wins: "#FFD700",        // Gold
        fastest: "#C0C0C0",     // Silver
        streak: "#CD7F32",      // Bronze
        easy: "#90EE90",        // Light Green
        medium: "#FFA500",      // Orange
        hard: "#FF4500"         // Red-Orange
    };

    submitScoreBtn.addEventListener("click", async () => {
        // Check if leaderboard has loaded
        if (!isLeaderboardLoaded) {
            alert("Please wait for the leaderboard to finish loading.");
            return;
        }

        // Rate limiting check
        const now = Date.now();
        if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
            const waitTime = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
            alert(`Please wait ${waitTime} seconds before submitting again.`);
            return;
        }

        // Get and validate stats
        const wins = validateNumber(document.getElementById("wins").textContent);
        const fastest = validateNumber(document.getElementById("fastestTime").textContent, 0, 999999);
        const streak = validateNumber(document.getElementById("streak").textContent);
        const easy = validateNumber(window.gameStats?.easyModeWins || 0);
        const medium = validateNumber(window.gameStats?.mediumModeWins || 0);
        const hard = validateNumber(window.gameStats?.hardModeWins || 0);
        
        // Additional validation - prevent submitting all zeros
        if (wins === 0 && streak === 0 && easy === 0 && medium === 0 && hard === 0 && (fastest === 0 || fastest === Infinity)) {
            alert("No valid stats to submit. Play some games first!");
            return;
        }

        // Additional validation
        if (wins < 0 || streak < 0 || fastest < 0) {
            alert("Invalid stats detected. Please play the game normally.");
            return;
        }

        const data = {
            username: sanitizeUsername(username),
            wins: wins,
            fastest: fastest === Infinity ? 999999 : fastest,
            streak: streak,
            easy: easy,
            medium: medium,
            hard: hard,
            timestamp: Date.now()
        };

        try {
            // Check if user already has an entry
            const q = query(
                collection(db, "leaderboard"),
                where("username", "==", data.username)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Update existing entry
                const userDoc = snapshot.docs[0];
                await updateDoc(doc(db, "leaderboard", userDoc.id), data);
                alert("Stats updated on leaderboard!");
            } else {
                // Create new entry
                await addDoc(collection(db, "leaderboard"), data);
                alert("Stats submitted to leaderboard!");
            }
            
            // Update last submit time only on success
            lastSubmitTime = now;
            
            await loadLeaderboard();
            await updateTrophies();
        } catch (error) {
            if (error.code === 'permission-denied') {
                alert("Permission denied. Please ensure App Check is working properly.");
            } else {
                alert("Error submitting stats. Please try again later.");
            }
        }
    });

    async function loadLeaderboard() {
        const mode = lbSelect.value;
        
        try {
            const q = query(
                collection(db, "leaderboard"),
                orderBy(mode, mode === "fastest" ? "asc" : "desc")
            );
            const snapshot = await getDocs(q);
            lbList.innerHTML = "";
            
            if (snapshot.empty) {
                const li = document.createElement("li");
                li.className = "lb-empty";
                li.textContent = "No entries yet";
                lbList.appendChild(li);
            } else {
                // Use a Map to track best entry per username
                const bestEntries = new Map();
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const displayValue = data[mode];
                    
                    // Skip entries with 0 or invalid values for mode-specific leaderboards
                    if ((mode === "easy" || mode === "medium" || mode === "hard") && (!displayValue || displayValue === 0)) {
                        return;
                    }
                    
                    // Skip invalid fastest times
                    if (mode === "fastest" && (!displayValue || displayValue === 999999 || displayValue === Infinity)) {
                        return;
                    }
                    
                    const displayUsername = sanitizeUsername(data.username || "Unknown");
                    
                    // Check if we already have an entry for this username
                    if (bestEntries.has(displayUsername)) {
                        const existing = bestEntries.get(displayUsername);
                        
                        // Compare and keep the better score
                        let shouldReplace = false;
                        if (mode === "fastest") {
                            // For fastest time, lower is better
                            shouldReplace = displayValue < existing.value;
                        } else {
                            // For all other modes, higher is better
                            shouldReplace = displayValue > existing.value;
                        }
                        
                        if (shouldReplace) {
                            bestEntries.set(displayUsername, {
                                value: displayValue,
                                username: displayUsername
                            });
                        }
                    } else {
                        // First entry for this username
                        bestEntries.set(displayUsername, {
                            value: displayValue,
                            username: displayUsername
                        });
                    }
                });
                
                // Convert map to sorted array
                const sortedEntries = Array.from(bestEntries.values()).sort((a, b) => {
                    if (mode === "fastest") {
                        return a.value - b.value; // Lower is better
                    } else {
                        return b.value - a.value; // Higher is better
                    }
                });
                
                // Display sorted entries
                if (sortedEntries.length === 0) {
                    const li = document.createElement("li");
                    li.className = "lb-empty";
                    li.textContent = "No entries yet for this mode";
                    lbList.appendChild(li);
                } else {
                    let rank = 1;
                    sortedEntries.forEach(entry => {
                        const li = document.createElement("li");
                        
                        let displayValue = entry.value;
                        if (mode === "fastest") {
                            displayValue = displayValue.toFixed(1) + "s";
                        }
                        
                        li.textContent = `#${rank} ${entry.username} — ${displayValue}`;
                        lbList.appendChild(li);
                        rank++;
                    });
                }
            }
            
            // Mark leaderboard as loaded and enable submit button
            if (!isLeaderboardLoaded) {
                isLeaderboardLoaded = true;
                submitScoreBtn.disabled = false;
                submitScoreBtn.textContent = "Submit Current Stats";
            }
        } catch (error) {
            lbList.innerHTML = "";
            const li = document.createElement("li");
            li.className = "lb-empty";
            li.textContent = "Error loading leaderboard";
            lbList.appendChild(li);
            
            // Still enable submit button even on error
            if (!isLeaderboardLoaded) {
                isLeaderboardLoaded = true;
                submitScoreBtn.disabled = false;
                submitScoreBtn.textContent = "Submit Current Stats";
            }
        }
    }

    async function updateTrophies() {
        const currentUsername = sanitizeUsername(localStorage.getItem("hk-username"));
        const trophies = [];

        // Check each category
        for (const category of ["wins", "fastest", "streak", "easy", "medium", "hard"]) {
            try {
                const q = query(
                    collection(db, "leaderboard"),
                    orderBy(category, category === "fastest" ? "asc" : "desc")
                );
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                    // Use same deduplication logic as leaderboard display
                    const bestEntries = new Map();
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const value = data[category];
                        
                        // Skip invalid entries
                        if (category === "fastest" && (!value || value === 999999 || value === Infinity)) {
                            return;
                        }
                        if ((category === "easy" || category === "medium" || category === "hard") && (!value || value === 0)) {
                            return;
                        }
                        
                        const displayUsername = sanitizeUsername(data.username || "Unknown");
                        
                        // Check if we already have an entry for this username
                        if (bestEntries.has(displayUsername)) {
                            const existing = bestEntries.get(displayUsername);
                            
                            // Compare and keep the better score
                            let shouldReplace = false;
                            if (category === "fastest") {
                                shouldReplace = value < existing.value;
                            } else {
                                shouldReplace = value > existing.value;
                            }
                            
                            if (shouldReplace) {
                                bestEntries.set(displayUsername, {
                                    value: value,
                                    username: displayUsername
                                });
                            }
                        } else {
                            bestEntries.set(displayUsername, {
                                value: value,
                                username: displayUsername
                            });
                        }
                    });
                    
                    // Sort and check if current user is #1
                    const sortedEntries = Array.from(bestEntries.values()).sort((a, b) => {
                        if (category === "fastest") {
                            return a.value - b.value;
                        } else {
                            return b.value - a.value;
                        }
                    });
                    
                    if (sortedEntries.length > 0 && sortedEntries[0].username === currentUsername) {
                        trophies.push({
                            category,
                            color: trophyColors[category]
                        });
                    }
                }
            } catch (error) {
                // Silently fail for trophy checking
            }
        }

        // Display trophies
        displayTrophies(trophies);
    }

    function displayTrophies(trophies) {
        trophyCase.innerHTML = "";
        
        if (trophies.length === 0) {
            return;
        }

        trophies.forEach(trophy => {
            const trophyEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            trophyEl.setAttribute("class", "trophy");
            trophyEl.setAttribute("width", "48");
            trophyEl.setAttribute("height", "48");
            trophyEl.setAttribute("viewBox", "0 0 60 60");
            
            // Helper function to adjust color brightness
            function adjustBrightness(color, percent) {
                const num = parseInt(color.replace("#",""), 16);
                const amt = Math.round(2.55 * percent);
                const R = Math.min(255, Math.max(0, (num >> 16) + amt));
                const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
                const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
                return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
            }

            const color = trophy.color;
            const brightColor = adjustBrightness(color, 30);
            const darkColor = adjustBrightness(color, -40);
            const safeColorId = color.replace('#', '');
            
            trophyEl.innerHTML = `
                <defs>
                    <radialGradient id="grad6-${safeColorId}">
                        <stop offset="0%" style="stop-color:${brightColor};stop-opacity:1" />
                        <stop offset="70%" style="stop-color:${color};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
                    </radialGradient>
                    <filter id="glow6-${safeColorId}">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="30" cy="30" r="18" fill="url(#grad6-${safeColorId})" 
                    stroke="#1a1a2a" stroke-width="2" filter="url(#glow6-${safeColorId})"/>
                <circle cx="30" cy="30" r="13" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                <circle cx="30" cy="30" r="8" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
                <text x="30" y="36" text-anchor="middle" font-size="16" font-weight="bold" fill="#1a1a2a">★</text>
            `;
            
            // Add tooltip
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            const categoryName = trophy.category.charAt(0).toUpperCase() + trophy.category.slice(1);
            title.textContent = `🏆 #1 in ${categoryName}`;
            trophyEl.appendChild(title);
            
            trophyCase.appendChild(trophyEl);
        });
    }

    // Show loading message initially
    lbList.innerHTML = "";
    const loadingLi = document.createElement("li");
    loadingLi.className = "lb-empty";
    loadingLi.textContent = "Loading leaderboard...";
    lbList.appendChild(loadingLi);

    lbSelect.addEventListener("change", loadLeaderboard);
    loadLeaderboard();
    updateTrophies();
});