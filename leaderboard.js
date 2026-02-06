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
    document.getElementById("lbUsername").textContent = "User: " + username;

    const lbSelect = document.getElementById("lbSelect");
    const lbList = document.getElementById("lbList");
    const submitScoreBtn = document.getElementById("submitScoreBtn");

    submitScoreBtn.addEventListener("click", async () => {
        const wins = Number(document.getElementById("wins").textContent);
        const fastest = Number(document.getElementById("fastestTime").textContent);
        const streak = Number(document.getElementById("streak").textContent);
        
        // Get mode-specific wins from game stats
        const easy = Number(window.gameStats?.easyModeWins || 0);
        const medium = Number(window.gameStats?.mediumModeWins || 0);
        const hard = Number(window.gameStats?.hardModeWins || 0);
        
        const data = {
            username,
            wins,
            fastest: fastest === Infinity ? 999999 : fastest,
            streak,
            easy,
            medium,
            hard,
            timestamp: Date.now()
        };

        try {
            // Check if user already has an entry
            const q = query(
                collection(db, "leaderboard"),
                where("username", "==", username)
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
            
            loadLeaderboard();
        } catch (error) {
            console.error("Error submitting stats:", error);
            alert("Error submitting stats. Check console for details.");
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
                return;
            }
            
            let rank = 1;
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement("li");
                
                let displayValue = data[mode];
                
                // Skip entries with 0 or invalid values for mode-specific leaderboards
                if ((mode === "easy" || mode === "medium" || mode === "hard") && (!displayValue || displayValue === 0)) {
                    return; // Skip this entry
                }
                
                // Format fastest time nicely
                if (mode === "fastest") {
                    if (!displayValue || displayValue === 999999 || displayValue === Infinity) {
                        return; // Skip entries with no time set
                    }
                    displayValue = displayValue.toFixed(1) + "s";
                }
                
                li.textContent = `#${rank} ${data.username} — ${displayValue}`;
                lbList.appendChild(li);
                rank++;
            });
            
            // If no valid entries were added
            if (lbList.children.length === 0) {
                const li = document.createElement("li");
                li.className = "lb-empty";
                li.textContent = "No entries yet for this mode";
                lbList.appendChild(li);
            }
        } catch (error) {
            console.error("Error loading leaderboard:", error);
            lbList.innerHTML = "";
            const li = document.createElement("li");
            li.className = "lb-empty";
            li.textContent = "Error loading leaderboard";
            lbList.appendChild(li);
        }
    }

    lbSelect.addEventListener("change", loadLeaderboard);
    loadLeaderboard();
});
