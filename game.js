// ===============================
// Hollow Knight Sound Guessing Game
// Fully Rewritten & Modernized
// ===============================

// Utility: Format filenames → Display names
function formatName(filename) {
    return filename
        .replace(".mp3", "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

// ===============================
// Sound Manager
// ===============================
class SoundManager {
    constructor(volumeSlider) {
        this.audio = new Audio();
        this.volumeSlider = volumeSlider;
        this.audio.volume = volumeSlider.value;

        volumeSlider.addEventListener("input", () => {
            this.audio.volume = volumeSlider.value;
        });
    }

    play(filePath) {
        this.audio.src = filePath;
        this.audio.play();
    }
}

// ===============================
// Timer Utility
// ===============================
class Timer {
    constructor(displayElement) {
        this.display = displayElement;
        this.time = 0;
        this.interval = null;
    }

    start() {
        this.time = 0;
        this.updateDisplay();
        this.interval = setInterval(() => {
            this.time += 0.1;
            this.updateDisplay();
        }, 100);
    }

    stop() {
        clearInterval(this.interval);
        return this.time;
    }

    updateDisplay() {
        this.display.textContent = this.time.toFixed(1) + "s";
    }
}

// ===============================
// UI Helper
// ===============================
class UI {
    constructor() {
        this.optionContainer = document.getElementById("options");
        this.roundDisplay = document.getElementById("roundDisplay");
        this.streakDisplay = document.getElementById("streakDisplay");
        this.fastestDisplay = document.getElementById("fastestTime");
        this.backgroundSelect = document.getElementById("backgroundSelect");
        this.searchToggle = document.getElementById("searchToggle");
        this.optionCount = document.getElementById("optionCount");
        this.timerMode = document.getElementById("timerMode");
    }

    setBackground(image) {
        document.body.style.backgroundImage = `url(${image})`;
    }

    updateRound(n) {
        this.roundDisplay.textContent = n;
    }

    updateStreak(n) {
        this.streakDisplay.textContent = n;
    }

    updateFastest(t) {
        this.fastestDisplay.textContent = t.toFixed(1) + "s";
    }

    clearOptions() {
        this.optionContainer.innerHTML = "";
    }

    addOption(text, callback) {
        const btn = document.createElement("button");
        btn.className = "optionBtn";
        btn.textContent = text;
        btn.onclick = callback;
        this.optionContainer.appendChild(btn);
    }
}

// ===============================
// Main Game Class
// ===============================
class Game {
    constructor() {
        this.soundFolder = "sounds/";
        this.soundFiles = [];
        this.currentSound = null;
        this.correctName = null;

        this.stats = {
            wins: 0,
            bestStreak: 0,
            fastestTime: Infinity,
            roundsCompleted: 0
        };

        this.settings = {
            searchMode: false,
            optionCount: 4,
            timerMode: "none"
        };

        // UI + Systems
        this.ui = new UI();
        this.timer = new Timer(document.getElementById("timerDisplay"));
        this.soundManager = new SoundManager(document.getElementById("volumeSlider"));

        // Bind UI events
        this.bindUI();
    }

    bindUI() {
        document.getElementById("playBtn").addEventListener("click", () => {
            if (this.currentSound) {
                this.soundManager.play(this.soundFolder + this.currentSound);
            }
        });

        this.ui.backgroundSelect.addEventListener("change", e => {
            this.ui.setBackground(e.target.value);
        });

        this.ui.searchToggle.addEventListener("change", e => {
            this.settings.searchMode = e.target.checked;
        });

        this.ui.optionCount.addEventListener("input", e => {
            this.settings.optionCount = parseInt(e.target.value);
        });

        this.ui.timerMode.addEventListener("change", e => {
            this.settings.timerMode = e.target.value;
        });
    }

    async loadSounds() {
        const response = await fetch(this.soundFolder + "list.json");
        this.soundFiles = await response.json();
        this.ui.optionCount.max = this.soundFiles.length;
        this.newRound();
    }

    newRound() {
        this.stats.roundsCompleted++;
        this.ui.updateRound(this.stats.roundsCompleted);

        // Timer
        if (this.settings.timerMode !== "none") {
            this.timer.start();
        }

        // Pick random sound
        this.currentSound = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
        this.correctName = formatName(this.currentSound);

        // Build options
        this.buildOptions();
    }

    buildOptions() {
        this.ui.clearOptions();

        const options = new Set([this.correctName]);

        while (options.size < this.settings.optionCount) {
            const random = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
            options.add(formatName(random));
        }

        [...options]
            .sort(() => Math.random() - 0.5)
            .forEach(name => {
                this.ui.addOption(name, () => this.handleGuess(name));
            });
    }

    handleGuess(name) {
        const correct = name === this.correctName;

        if (this.settings.timerMode !== "none") {
            const time = this.timer.stop();
            if (correct && time < this.stats.fastestTime) {
                this.stats.fastestTime = time;
                this.ui.updateFastest(time);
            }
        }

        if (correct) {
            this.stats.wins++;
            this.stats.bestStreak++;
            this.ui.updateStreak(this.stats.bestStreak);
        } else {
            this.stats.bestStreak = 0;
            this.ui.updateStreak(0);
        }

        this.newRound();
    }
}

// ===============================
// Initialize Game
// ===============================
const game = new Game();
game.loadSounds();

// ===============================
// Leaderboard Export
// ===============================
window.gameStats = {
    get wins() { return game.stats.wins },
    get fastestTime() { return game.stats.fastestTime },
    get bestStreak() { return game.stats.bestStreak },
    get timerMode() { return game.settings.timerMode },
    get roundsCompleted() { return game.stats.roundsCompleted }
};
