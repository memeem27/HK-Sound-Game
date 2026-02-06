// ===============================
// Hollow Knight Sound Guessing Game
// Merged for current test branch
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
        if (this.display) {
            this.display.textContent = this.time.toFixed(1) + "s";
        }
    }
}

// ===============================
// UI Helper
// ===============================
class UI {
    constructor() {
        this.optionContainer = document.getElementById("choices");
        this.streakDisplay = document.getElementById("streak");
        this.fastestDisplay = document.getElementById("fastestTime");
        this.backgroundSelect = document.getElementById("bgSelect");
        this.searchToggle = document.getElementById("searchToggle");
        this.optionCount = document.getElementById("optionCount");
        this.timerMode = document.getElementsByName("timerMode");
    }

    setBackground(src) {
        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo && src) {
            bgVideo.src = src;
            bgVideo.load();
            bgVideo.play().catch(() => {
                const playOnInteract = () => {
                    bgVideo.play();
                    document.removeEventListener("click", playOnInteract);
                };
                document.addEventListener("click", playOnInteract);
            });
        }
    }

    updateStreak(n) {
        if (this.streakDisplay) this.streakDisplay.textContent = n;
    }

    updateFastest(t) {
        if (this.fastestDisplay && t !== Infinity) {
            this.fastestDisplay.textContent = t.toFixed(1);
        }
    }

    clearOptions() {
        if (this.optionContainer) {
            this.optionContainer.innerHTML = "";
        }
    }

    addOption(text) {
        if (!this.optionContainer) return;
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
            optionCount: 5,
            timerMode: "off" // match HTML default
        };

        this.ui = new UI();
        this.timer = new Timer(document.getElementById("timerDisplay"));
        this.soundManager = new SoundManager(document.getElementById("volumeSlider"));

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
        const searchContainer = document.getElementById("searchContainer");
        const choices = document.getElementById("choices");

        if (searchToggle && searchContainer && choices) {
            searchToggle.addEventListener("click", () => {
                this.settings.searchMode = !this.settings.searchMode;
                if (this.settings.searchMode) {
                    searchContainer.style.display = "block";
                    choices.style.display = "none";
                    searchToggle.textContent = "Disable Search";
                } else {
                    searchContainer.style.display = "none";
                    choices.style.display = "block";
                    searchToggle.textContent = "Enable Search";
                }
            });
        }

        if (this.ui.optionCount) {
            this.ui.optionCount.addEventListener("input", e => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                    this.settings.optionCount = val;
                }
            });
        }

        if (this.ui.timerMode) {
            this.ui.timerMode.forEach(radio => {
                radio.addEventListener("change", e => {
                    this.settings.timerMode = e.target.value;
                    const timerDisplay = document.getElementById("timerDisplay");
                    if (timerDisplay) {
                        timerDisplay.style.display =
                            e.target.value === "off" ? "none" : "block";
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
        try {
            const response = await fetch(this.soundFolder + "list.json");
            this.soundFiles = await response.json();
            if (this.ui.optionCount) {
                this.ui.optionCount.max = this.soundFiles.length;
            }
            this.newRound();
        } catch (e) {
            console.error("Failed to load sounds/list.json", e);
        }
    }

    newRound() {
        this.stats.roundsCompleted++;

        if (this.settings.timerMode !== "off") {
            this.timer.start();
        }

        if (!this.soundFiles.length) return;

        this.currentSound = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
        this.correctName = formatName(this.currentSound);

        const actualOptionCount = Math.min(this.settings.optionCount, this.soundFiles.length);
        this.buildOptions(actualOptionCount);
    }

    buildOptions(count) {
        this.ui.clearOptions();
        if (!this.soundFiles.length) return;

        const options = new Set([this.correctName]);

        while (options.size < count) {
            const random = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
            options.add(formatName(random));
        }

        [...options]
            .sort(() => Math.random() - 0.5)
            .forEach(name => this.ui.addOption(name));
    }

    handleGuess() {
        if (!this.ui.optionContainer) return;

        const guess = this.ui.optionContainer.value;
        const correct = guess === this.correctName;

        if (this.settings.timerMode !== "off") {
            const time = this.timer.stop();
            if (correct && (time < this.stats.fastestTime || this.stats.fastestTime === Infinity)) {
                this.stats.fastestTime = time;
                this.ui.updateFastest(time);
            }
        }

        const resultEl = document.getElementById("result");
        const winsEl = document.getElementById("wins");
        const streakEl = document.getElementById("streak");

        if (correct) {
            this.stats.wins++;
            if (winsEl) winsEl.textContent = this.stats.wins;
            this.stats.bestStreak++;
            this.ui.updateStreak(this.stats.bestStreak);
            if (resultEl) {
                resultEl.textContent = "Correct!";
                resultEl.style.color = "lightgreen";
            }
        } else {
            this.stats.bestStreak = 0;
            this.ui.updateStreak(0);
            if (resultEl) {
                resultEl.textContent = "Wrong! It was: " + this.correctName;
                resultEl.style.color = "salmon";
            }
        }

        this.newRound();
    }
}

// ===============================
// Leaderboard Export
// ===============================
let game = null;

window.gameStats = {
    get wins() { return game?.stats.wins ?? 0; },
    get fastestTime() { return game?.stats.fastestTime ?? Infinity; },
    get bestStreak() { return game?.stats.bestStreak ?? 0; },
    get timerMode() { return game?.settings.timerMode ?? "off"; },
    get roundsCompleted() { return game?.stats.roundsCompleted ?? 0; }
};

// ===============================
// Initialize Game
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    game = new Game();
    game.loadSounds();

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            game.handleGuess();
        });
    }

    if (game.ui.backgroundSelect) {
        const initial = game.ui.backgroundSelect.value || "backgrounds/Classic.mp4";
        game.ui.setBackground(initial);
    }
});
