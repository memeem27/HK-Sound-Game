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
        this.audio.volume = volumeSlider.value / 100;

        volumeSlider.addEventListener("input", () => {
            this.audio.volume = volumeSlider.value / 100;
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
        this.optionContainer = document.getElementById("choices");
        this.roundDisplay = document.getElementById("wins"); // Assuming wins as proxy for round for now or just fixing the ID
        this.streakDisplay = document.getElementById("streak");
        this.fastestDisplay = document.getElementById("fastestTime");
        this.backgroundSelect = document.getElementById("bgSelect");
        this.searchToggle = document.getElementById("searchToggle");
        this.optionCount = document.getElementById("optionCount");
        this.timerMode = document.getElementsByName("timerMode");
    }

    setBackground(image) {
        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo && image) {
            bgVideo.src = image;
            bgVideo.load();
            bgVideo.play().catch(e => {
                console.log("Video play failed, retrying on user interaction:", e);
                // Handle autoplay restrictions
                const playOnInteract = () => {
                    bgVideo.play();
                    document.removeEventListener("click", playOnInteract);
                };
                document.addEventListener("click", playOnInteract);
            });
        }
    }

    updateRound(n) {
        // Round display doesn't exist in HTML, skipping or mapping to something else
    }

    updateStreak(n) {
        if (this.streakDisplay) this.streakDisplay.textContent = n;
    }

    updateFastest(t) {
        if (this.fastestDisplay) this.fastestDisplay.textContent = t.toFixed(1) + "s";
    }

    clearOptions() {
        this.optionContainer.innerHTML = "";
    }

    addOption(text) {
        const option = document.createElement("option");
        option.value = text;
        option.textContent = text;
        this.optionContainer.appendChild(option);
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
        const playBtn = document.getElementById("playBtn");
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                if (this.currentSound) {
                    this.soundManager.play(this.soundFolder + this.currentSound);
                }
            });
        }

        if (this.ui.backgroundSelect) {
            this.ui.backgroundSelect.addEventListener("change", e => {
                this.ui.setBackground(e.target.value);
            });
        }

        const searchToggle = document.getElementById("searchToggle");
        if (searchToggle) {
            searchToggle.addEventListener("click", () => {
                this.settings.searchMode = !this.settings.searchMode;
                const container = document.getElementById("searchContainer");
                const choices = document.getElementById("choices");
                if (container && choices) {
                    if (this.settings.searchMode) {
                        container.style.display = "block";
                        choices.style.display = "none";
                        searchToggle.textContent = "Disable Search";
                    } else {
                        container.style.display = "none";
                        choices.style.display = "block";
                        searchToggle.textContent = "Enable Search";
                    }
                }
            });
        }

        if (this.ui.optionCount) {
            this.ui.optionCount.addEventListener("input", e => {
                this.settings.optionCount = parseInt(e.target.value);
            });
        }

        if (this.ui.timerMode) {
            this.ui.timerMode.forEach(radio => {
                radio.addEventListener("change", e => {
                    this.settings.timerMode = e.target.value;
                    const timerDisplay = document.getElementById("timerDisplay");
                    if (timerDisplay) {
                        timerDisplay.style.display = (e.target.value === "off") ? "none" : "block";
                    }
                });
            });
        }

        const menuBtn = document.getElementById("menuBtn");
        const menuPanel = document.getElementById("menuPanel");
        if (menuBtn && menuPanel) {
            menuBtn.addEventListener("click", () => {
                menuPanel.classList.toggle("open");
            });
        }

        const leaderboardBtn = document.getElementById("leaderboardBtn");
        const leaderboardPanel = document.getElementById("leaderboardPanel");
        if (leaderboardBtn && leaderboardPanel) {
            leaderboardBtn.addEventListener("click", () => {
                leaderboardPanel.classList.toggle("open");
            });
        }
    }

    async loadSounds() {
        const response = await fetch(this.soundFolder + "list.json");
        this.soundFiles = await response.json();
        this.ui.optionCount.max = this.soundFiles.length;
        this.newRound();
    }

    newRound() {
        this.stats.roundsCompleted++;
        // this.ui.updateRound(this.stats.roundsCompleted);

        // Timer
        if (this.settings.timerMode !== "off") {
            this.timer.start();
        }

        // Pick random sound
        this.currentSound = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
        this.correctName = formatName(this.currentSound);

        // Update optionCount max and current value if needed
        const actualOptionCount = Math.min(this.settings.optionCount, this.soundFiles.length);

        // Build options
        this.buildOptions(actualOptionCount);
    }

    buildOptions(count) {
        this.ui.clearOptions();

        const options = new Set([this.correctName]);

        while (options.size < count) {
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
        const guess = this.ui.optionContainer.value;
        const correct = guess === this.correctName;

        if (this.settings.timerMode !== "off") {
            const time = this.timer.stop();
            if (correct && (time < this.stats.fastestTime || this.stats.fastestTime === Infinity)) {
                this.stats.fastestTime = time;
                this.ui.updateFastest(time);
            }
        }

        if (correct) {
            this.stats.wins++;
            document.getElementById("wins").textContent = this.stats.wins;
            this.stats.bestStreak++;
            this.ui.updateStreak(this.stats.bestStreak);
            document.getElementById("result").textContent = "Correct!";
            document.getElementById("result").style.color = "lightgreen";
        } else {
            this.stats.bestStreak = 0;
            this.ui.updateStreak(0);
            document.getElementById("result").textContent = "Wrong! It was: " + this.correctName;
            document.getElementById("result").style.color = "salmon";
        }

        this.newRound();
    }
}

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

// ===============================
// Initialize Game
// ===============================
const game = new Game();
game.loadSounds();

// Initial background load
if (game.ui.backgroundSelect) {
    game.ui.setBackground(game.ui.backgroundSelect.value || "backgrounds/Classic.mp4");
}

document.getElementById("submitBtn").addEventListener("click", () => {
    game.handleGuess();
});

// Remove duplicate background logic that might conflict with Game class
// document.addEventListener("DOMContentLoaded", () => { ... });

