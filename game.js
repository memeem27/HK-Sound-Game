/* -----------------------------
   GAME STATE + STATS
------------------------------ */

let wins = parseInt(localStorage.getItem("wins") || "0");
let losses = parseInt(localStorage.getItem("losses") || "0");
let streak = parseInt(localStorage.getItem("streak") || "0");
let bestStreak = parseInt(localStorage.getItem("bestStreak") || "0");

let totalTime = parseFloat(localStorage.getItem("totalTime") || "0");
let totalTimedCorrect = parseInt(localStorage.getItem("totalTimedCorrect") || "0");
let fastestTime = parseFloat(localStorage.getItem("fastestTime") || "0");

let roundsCompleted = 0;

const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const streakEl = document.getElementById("streak");
const bestStreakEl = document.getElementById("bestStreak");
const avgTimeEl = document.getElementById("avgTime");
const fastestTimeEl = document.getElementById("fastestTime");

function saveStats() {
    localStorage.setItem("wins", wins);
    localStorage.setItem("losses", losses);
    localStorage.setItem("streak", streak);
    localStorage.setItem("bestStreak", bestStreak);
    localStorage.setItem("totalTime", totalTime);
    localStorage.setItem("totalTimedCorrect", totalTimedCorrect);
    localStorage.setItem("fastestTime", fastestTime);
}

function updateStatsDisplay() {
    winsEl.textContent = wins;
    lossesEl.textContent = losses;
    streakEl.textContent = streak;
    bestStreakEl.textContent = bestStreak;

    const avg = totalTimedCorrect > 0 ? (totalTime / totalTimedCorrect).toFixed(2) : 0;
    avgTimeEl.textContent = avg;
    fastestTimeEl.textContent = fastestTime > 0 ? fastestTime.toFixed(2) : 0;
}

updateStatsDisplay();


/* -----------------------------
   TIMER MODE
------------------------------ */

const timerDisplay = document.getElementById("timerDisplay");
let timerMode = "off";
let timeLeft = 0;
let timerInterval = null;
let roundStartTime = 0;

function getTimerSeconds() {
    if (timerMode === "easy") return 45;
    if (timerMode === "medium") return 30;
    if (timerMode === "hard") return 15;
    return 0;
}

function startTimer() {
    if (timerMode === "off") {
        timerDisplay.style.display = "none";
        return;
    }

    timeLeft = getTimerSeconds();
    timerDisplay.style.display = "block";
    updateTimerDisplay();

    roundStartTime = performance.now();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = timeLeft + "s";

    if (timeLeft <= 3) {
        timerDisplay.style.color = "red";
        timerDisplay.style.textShadow = "0 0 20px red";
    } else if (timeLeft <= 5) {
        timerDisplay.style.color = "red";
        timerDisplay.style.textShadow = "0 0 12px red";
    } else if (timeLeft <= 10) {
        timerDisplay.style.color = "yellow";
        timerDisplay.style.textShadow = "0 0 12px yellow";
    } else {
        timerDisplay.style.color = "#d7d7ff";
        timerDisplay.style.textShadow = "0 0 12px #6a6aff";
    }
}


/* -----------------------------
   SCORE MODAL
------------------------------ */

const scoreModal = document.getElementById("scoreModal");
const scoreText = document.getElementById("scoreText");
const scoreTitle = document.getElementById("scoreTitle");
const playAgainBtn = document.getElementById("playAgainBtn");

function showScoreModal(titleText) {
    scoreTitle.textContent = titleText;
    scoreText.innerHTML = `
        Correct Answers: ${wins}<br>
        Streak: ${streak}<br>
        Rounds Completed: ${roundsCompleted}<br>
        Average Time: ${(totalTimedCorrect > 0 ? (totalTime / totalTimedCorrect).toFixed(2) : 0)}s<br>
        Fastest Time: ${fastestTime > 0 ? fastestTime.toFixed(2) : 0}s
    `;
    scoreModal.style.display = "flex";
}

function handleTimeUp() {
    stopAudio();

    losses++;
    streak = 0;
    roundsCompleted = 0;

    saveStats();
    updateStatsDisplay();

    showScoreModal("Time's Up!");
}

playAgainBtn.onclick = () => {
    scoreModal.style.display = "none";
    newRound();
};


/* -----------------------------
   SOUND + GAME LOGIC
------------------------------ */

const soundFolder = "sounds/";
const bgFolder = "backgrounds/";

let soundFiles = [];
let correctAnswer = "";
let searchEnabled = false;
let currentAudio = null;

const bgVideo = document.getElementById("bgVideo");
const bgSelect = document.getElementById("bgSelect");
const zoteOption = document.getElementById("zoteOption");
const volumeSlider = document.getElementById("volumeSlider");
const optionCount = document.getElementById("optionCount");
const searchToggle = document.getElementById("searchToggle");

const choices = document.getElementById("choices");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");
const searchList = document.getElementById("searchList");

bgVideo.src = bgFolder + "Classic.mp4";
bgSelect.value = "Classic.mp4";
bgVideo.muted = true;

let targetVolume = 0.35;

function enableAudio() {
    bgVideo.muted = false;
    bgVideo.volume = targetVolume;
    window.removeEventListener("click", enableAudio);
}
window.addEventListener("click", enableAudio);

volumeSlider.oninput = () => {
    targetVolume = volumeSlider.value / 100;
    bgVideo.volume = targetVolume;
    bgVideo.muted = targetVolume === 0;
};

bgSelect.onchange = () => {
    bgVideo.src = bgFolder + bgSelect.value;
};

const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

menuBtn.onclick = () => {
    menuPanel.classList.toggle("open");
};

const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardPanel = document.getElementById("leaderboardPanel");

leaderboardBtn.onclick = () => {
    const open = leaderboardPanel.classList.toggle("open");
    leaderboardBtn.style.left = open ? "350px" : "30px";
};

async function loadSounds() {
    const response = await fetch(soundFolder + "list.json");
    soundFiles = await response.json();
    optionCount.max = soundFiles.length;
    newRound();
}

function generateOptions() {
    let count = parseInt(optionCount.value);
    if (count < 5) count = 5;
    if (count > soundFiles.length) count = soundFiles.length;
    optionCount.value = count;

    const options = new Set([correctAnswer]);
    while (options.size < count) {
        options.add(soundFiles[Math.floor(Math.random() * soundFiles.length)]);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
}

function populateDropdown() {
    choices.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.textContent = "Select Sound";
    placeholder.disabled = true;
    placeholder.selected = true;
    choices.appendChild(placeholder);

    generateOptions().forEach(file => {
        const opt = document.createElement("option");
        opt.value = file;
        opt.textContent = file.replace(/\.ogg$/i, "");
        choices.appendChild(opt);
    });
}

function populateSearchList() {
    searchList.innerHTML = "";
    generateOptions().forEach(file => {
        const li = document.createElement("li");
        li.textContent = file.replace(/\.ogg$/i, "");
        li.onclick = () => searchInput.value = li.textContent;
        searchList.appendChild(li);
    });
}

searchInput.oninput = () => {
    const filter = searchInput.value.toLowerCase();
    Array.from(searchList.children).forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(filter) ? "" : "none";
    });
};

searchToggle.onclick = () => {
    searchEnabled = !searchEnabled;
    if (searchEnabled) {
        searchToggle.textContent = "Disable Search";
        choices.style.display = "none";
        searchContainer.style.display = "block";
        populateSearchList();
    } else {
        searchToggle.textContent = "Enable Search";
        searchContainer.style.display = "none";
        choices.style.display = "inline-block";
    }
};

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

function playSound(file) {
    stopAudio();
    currentAudio = new Audio(soundFolder + file);
    currentAudio.play();
}

function newRound() {
    correctAnswer = soundFiles[Math.floor(Math.random() * soundFiles.length)];
    if (searchEnabled) populateSearchList();
    else populateDropdown();
    document.getElementById("result").textContent = "";

    if (timerMode !== "off") startTimer();
}

document.getElementById("playBtn").onclick = () => playSound(correctAnswer);

document.getElementById("submitBtn").onclick = () => {
    stopAudio();

    let guess = searchEnabled ? searchInput.value + ".ogg" : choices.value;
    const result = document.getElementById("result");

    const timeTaken = timerMode !== "off" ? (performance.now() - roundStartTime) / 1000 : 0;

    if (guess && guess.replace(/\.ogg$/i, "") === correctAnswer.replace(/\.ogg$/i, "")) {
        result.textContent = "Correct!";
        result.style.color = "lightgreen";

        wins++;
        streak++;
        roundsCompleted++;

        if (streak > bestStreak) bestStreak = streak;

        if (timerMode !== "off") {
            totalTime += timeTaken;
            totalTimedCorrect++;

            if (fastestTime === 0 || timeTaken < fastestTime) {
                fastestTime = timeTaken;
            }
        }

        if (correctAnswer.toLowerCase().includes("zote")) {
            zoteOption.disabled = false;
            bgSelect.value = "Zote.mp4";
            bgVideo.src = bgFolder + "Zote.mp4";
        }

        saveStats();
        updateStatsDisplay();
        setTimeout(newRound, 1500);

    } else {
        result.textContent = "Wrong! Correct answer was: " + correctAnswer.replace(/\.ogg$/i, "");
        result.style.color = "salmon";

        losses++;
        streak = 0;
        roundsCompleted = 0;

        saveStats();
        updateStatsDisplay();

        if (timerMode !== "off") {
            showScoreModal("Incorrect Answer");
        } else {
            setTimeout(newRound, 1500);
        }
    }
};


/* -----------------------------
   TIMER MODE SELECTION
------------------------------ */

document.querySelectorAll("input[name='timerMode']").forEach(radio => {
    radio.onchange = () => {
        timerMode = radio.value;
        clearInterval(timerInterval);
        if (timerMode === "off") {
            timerDisplay.style.display = "none";
        } else {
            startTimer();
        }
    };
});


/* -----------------------------
   INITIAL LOAD
------------------------------ */

loadSounds();
