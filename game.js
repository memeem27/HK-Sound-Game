// ===============================
// Hollow Knight Sound Guessing Game
// Fixed search mode functionality
// ===============================

// Utility: Format filenames → Display names
function formatName(filename) {
    return filename
        .replace(".mp3", "")
        .replace(".ogg", "")
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
        this.duration = null;
        this.onTimeout = null;
    }

    start(durationSeconds) {
        // reset any existing interval
        clearInterval(this.interval);

        if (typeof durationSeconds === "number" && durationSeconds > 0) {
            // countdown mode
            this.duration = durationSeconds;
            this.time = durationSeconds;
        } else {
            // simple stopwatch mode
            this.duration = null;
            this.time = 0;
        }

        this.updateDisplay();

        this.interval = setInterval(() => {
            if (this.duration !== null) {
                // countdown
                this.time = Math.max(0, this.time - 0.1);
                this.updateDisplay();
                if (this.time <= 0) {
                    clearInterval(this.interval);
                    if (typeof this.onTimeout === "function") {
                        this.onTimeout();
                    }
                }
            } else {
                // count up
                this.time += 0.1;
                this.updateDisplay();
            }
        }, 100);
    }

    stop() {
        clearInterval(this.interval);
        let elapsed;
        if (this.duration !== null) {
            // duration - remaining
            elapsed = this.duration - this.time;
        } else {
            elapsed = this.time;
        }
        return elapsed;
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
        this.searchContainer = document.getElementById("searchContainer");
        this.searchInput = document.getElementById("searchInput");
        this.searchList = document.getElementById("searchList");

        this.winsDisplay = document.getElementById("wins");
        this.lossesDisplay = document.getElementById("losses");
        this.winLossDisplay = document.getElementById("winLossRatio");
        this.streakDisplay = document.getElementById("streak");
        this.fastestDisplay = document.getElementById("fastestTime");
        this.backgroundSelect = document.getElementById("bgSelect");
        this.optionCount = document.getElementById("optionCount");
        this.timerMode = document.getElementsByName("timerMode");
    }

    setBackground(src) {
        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo && src) {
            bgVideo.src = src;
            bgVideo.volume = document.getElementById("volumeSlider").value / 100;
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

    updateWins(n) {
        if (this.winsDisplay) this.winsDisplay.textContent = n;
    }

    updateLosses(n) {
        if (this.lossesDisplay) this.lossesDisplay.textContent = n;
    }

    updateWinLossRatio(wins, losses) {
        if (!this.winLossDisplay) return;
        let ratioText = "0";
        if (losses === 0) {
            ratioText = wins > 0 ? "∞" : "0";
        } else {
            ratioText = (wins / losses).toFixed(2);
        }
        this.winLossDisplay.textContent = ratioText;
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
        this.optionContainer.innerHTML = "";
    }

    addOption(text) {
        const option = document.createElement("option");
        option.value = text;
        option.textContent = text;
        this.optionContainer.appendChild(option);
    }

    populateSearchList(options) {
        this.searchList.innerHTML = "";
        options.forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.addEventListener("click", () => {
                // Update both the search input and set the selected answer
                this.searchInput.value = name;
                // Store the selected answer for submission
                this.searchInput.dataset.selected = name;
                // Clear the list after selection
                this.searchList.innerHTML = "";
                // Visual feedback
                this.searchInput.style.background = "#2a4a2a";
                setTimeout(() => {
                    this.searchInput.style.background = "";
                }, 300);
            });
            this.searchList.appendChild(li);
        });
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
            losses: 0,
            bestStreak: 0,
            fastestTime: Infinity,
            roundsCompleted: 0,
            easyModeWins: 0,
            mediumModeWins: 0,
            hardModeWins: 0
        };

        this.settings = {
            searchMode: false,
            optionCount: 5,
            timerMode: "off"
        };

        this.ui = new UI();
        this.timer = new Timer(document.getElementById("timerDisplay"));
        this.timer.onTimeout = () => this.handleTimeout();
        this.soundManager = new SoundManager(document.getElementById("volumeSlider"));

        this.sessionStats = {
            streak: 0,
            fastestTime: Infinity,
            totalTime: 0,
            rounds: 0
        };

        this.scoreModal = document.getElementById("scoreModal");
        this.scoreTitle = document.getElementById("scoreTitle");
        this.scoreText = document.getElementById("scoreText");
        this.playAgainBtn = document.getElementById("playAgainBtn");

        this.bindUI();
        this.updateStatsUI();

        if (this.playAgainBtn) {
            this.playAgainBtn.addEventListener("click", () => {
                this.hideScoreModal();
                this.newRound();
            });
        }
    }

    bindUI() {
        // Play sound
        document.getElementById("playBtn").addEventListener("click", () => {
            if (this.currentSound) {
                this.soundManager.play(this.soundFolder + this.currentSound);
            }
        });

        // Background change
        this.ui.backgroundSelect.addEventListener("change", e => {
            this.ui.setBackground(e.target.value);
        });

        // Search toggle
        const searchToggle = document.getElementById("searchToggle");
        searchToggle.addEventListener("click", () => {
            this.settings.searchMode = !this.settings.searchMode;

            if (this.settings.searchMode) {
                this.ui.searchContainer.style.display = "block";
                this.ui.optionContainer.style.display = "none";
                searchToggle.textContent = "Disable Search";
            } else {
                this.ui.searchContainer.style.display = "none";
                this.ui.optionContainer.style.display = "block";
                searchToggle.textContent = "Enable Search";
            }
        });

        // Search input - show all options when focused
        this.ui.searchInput.addEventListener("focus", () => {
            // Show all available options when clicking into search
            const allOptions = this.soundFiles.map(f => formatName(f));
            this.ui.populateSearchList(allOptions);
        });

        // Search input - filter as user types
        this.ui.searchInput.addEventListener("input", () => {
            const query = this.ui.searchInput.value.toLowerCase();
            
            // Clear selected answer when user starts typing again
            delete this.ui.searchInput.dataset.selected;
            
            const filtered = this.soundFiles
                .map(f => formatName(f))
                .filter(name => name.toLowerCase().includes(query));

            this.ui.populateSearchList(filtered);
        });

        // Option count
        this.ui.optionCount.addEventListener("input", e => {
            const val = parseInt(e.target.value, 10);
            if (isNaN(val)) return;

            // Enforce minimum of 5 options
            let clamped = Math.max(5, val);

            // Optional: don't allow more than total sounds once loaded
            if (this.soundFiles.length > 0) {
                clamped = Math.min(clamped, this.soundFiles.length);
            }

            this.settings.optionCount = clamped;
            e.target.value = clamped;

            // When the number of options changes, refresh the question
            if (this.soundFiles.length > 0) {
                this.newRound();
            }
        });

        // Timer mode
        this.ui.timerMode.forEach(radio => {
            radio.addEventListener("change", e => {
                this.settings.timerMode = e.target.value;
                const timerDisplay = document.getElementById("timerDisplay");
                timerDisplay.style.display =
                    e.target.value === "off" ? "none" : "block";

                // When a timer mode is selected, immediately start a new
                // timed round (once sounds are loaded) so the countdown
                // begins right away.
                if (e.target.value !== "off" && this.soundFiles.length > 0) {
                    this.newRound();
                }
            });
        });

        // Menu toggle
        document.getElementById("menuBtn").addEventListener("click", () => {
            document.getElementById("menuPanel").classList.toggle("open");
        });

        // Leaderboard toggle
        document.getElementById("leaderboardBtn").addEventListener("click", () => {
            document.getElementById("leaderboardPanel").classList.toggle("open");
        });

        // Volume slider controls background video too
        const bgVideo = document.getElementById("bgVideo");
        const volumeSlider = document.getElementById("volumeSlider");

        volumeSlider.addEventListener("input", () => {
            bgVideo.volume = volumeSlider.value / 100;
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

        // Clear search input for new round
        if (this.ui.searchInput) {
            this.ui.searchInput.value = "";
            delete this.ui.searchInput.dataset.selected;
            this.ui.searchList.innerHTML = "";
        }

        if (this.settings.timerMode !== "off") {
            this.timer.start(this.getTimerDuration());
        }

        this.currentSound = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
        this.correctName = formatName(this.currentSound);

        const count = Math.min(this.settings.optionCount, this.soundFiles.length);
        this.buildOptions(count);
    }

    getTimerDuration() {
        switch (this.settings.timerMode) {
            case "easy":
                return 45;
            case "medium":
                return 30;
            case "hard":
                return 15;
            default:
                return 0;
        }
    }

    buildOptions(count) {
        this.ui.clearOptions();

        // Add placeholder option so nothing is selected by default
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose option";
        placeholder.disabled = true;
        placeholder.selected = true;
        this.ui.optionContainer.appendChild(placeholder);

        const options = new Set([this.correctName]);

        while (options.size < count) {
            const random = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
            options.add(formatName(random));
        }

        const list = [...options].sort(() => Math.random() - 0.5);

        list.forEach(name => this.ui.addOption(name));
    }

    updateStatsUI() {
        this.ui.updateWins(this.stats.wins);
        this.ui.updateLosses(this.stats.losses);
        this.ui.updateWinLossRatio(this.stats.wins, this.stats.losses);
        this.ui.updateStreak(this.stats.bestStreak);
        this.ui.updateFastest(this.stats.fastestTime);
    }

    updateSessionStatsOnCorrect(time) {
        if (this.settings.timerMode === "off") return;
        this.sessionStats.streak++;
        this.sessionStats.totalTime += time;
        this.sessionStats.rounds++;
        if (time < this.sessionStats.fastestTime) {
            this.sessionStats.fastestTime = time;
        }
    }

    getSessionSummaryText() {
        const streak = this.sessionStats.streak;
        const fastest = this.sessionStats.fastestTime;
        const rounds = this.sessionStats.rounds;
        const avg = rounds > 0 ? this.sessionStats.totalTime / rounds : null;

        const fastestText = fastest === Infinity ? "N/A" : fastest.toFixed(1) + "s";
        const avgText = avg === null ? "N/A" : avg.toFixed(1) + "s";

        return `Streak this run: ${streak}
Fastest time this run: ${fastestText}
Average time this run: ${avgText}`;
    }

    resetSessionStats() {
        this.sessionStats.streak = 0;
        this.sessionStats.fastestTime = Infinity;
        this.sessionStats.totalTime = 0;
        this.sessionStats.rounds = 0;
    }

    showScoreModal(title) {
        if (!this.scoreModal || !this.scoreText) return;
        if (this.scoreTitle) this.scoreTitle.textContent = title;
        this.scoreText.textContent = this.getSessionSummaryText();
        if (this.scoreModal) this.scoreModal.style.display = "flex";
        this.resetSessionStats();
    }

    hideScoreModal() {
        if (this.scoreModal) {
            this.scoreModal.style.display = "none";
        }
    }

    handleTimeout() {
        // Timer-mode-only loss that does not affect overall stats
        if (this.settings.timerMode === "off") return;
        this.showScoreModal("Time's Up!");
    }

    handleGuess() {
        let guess;
        
        // Get guess from search mode or dropdown
        if (this.settings.searchMode) {
            guess = this.ui.searchInput.dataset.selected;
        } else {
            guess = this.ui.optionContainer.value;
        }

        // Require the player to choose an option
        if (!guess) {
            const result = document.getElementById("result");
            if (result) {
                result.textContent = this.settings.searchMode 
                    ? "Please select an option from the list." 
                    : "Please choose an option.";
                result.style.color = "white";
            }
            return;
        }

        const correct = guess === this.correctName;

        let time = null;
        if (this.settings.timerMode !== "off") {
            time = this.timer.stop();
            if (correct && time < this.stats.fastestTime) {
                this.stats.fastestTime = time;
            }
        }

        const result = document.getElementById("result");

        if (correct) {
            this.stats.wins++;
            this.stats.bestStreak++;
            
            // Track mode-specific wins
            if (this.settings.timerMode === "easy") {
                this.stats.easyModeWins++;
            } else if (this.settings.timerMode === "medium") {
                this.stats.mediumModeWins++;
            } else if (this.settings.timerMode === "hard") {
                this.stats.hardModeWins++;
            }
            
            if (time !== null) {
                this.updateSessionStatsOnCorrect(time);
            }
            result.textContent = "Correct!";
            result.style.color = "lightgreen";
        } else {
            this.stats.losses++;
            this.stats.bestStreak = 0;
            result.textContent = "Wrong! It was: " + this.correctName;
            result.style.color = "salmon";

            if (this.settings.timerMode !== "off") {
                this.showScoreModal("Incorrect!");
                this.updateStatsUI();
                return;
            }
        }

        this.updateStatsUI();
        this.newRound();
    }
}

let game = null;

// Leaderboard export
window.gameStats = {
    get wins() { return game?.stats.wins ?? 0; },
    get fastestTime() { return game?.stats.fastestTime ?? Infinity; },
    get bestStreak() { return game?.stats.bestStreak ?? 0; },
    get timerMode() { return game?.settings.timerMode ?? "off"; },
    get roundsCompleted() { return game?.stats.roundsCompleted ?? 0; },
    get easyModeWins() { return game?.stats.easyModeWins ?? 0; },
    get mediumModeWins() { return game?.stats.mediumModeWins ?? 0; },
    get hardModeWins() { return game?.stats.hardModeWins ?? 0; }
};

// ===============================
// Initialize Game
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    game = new Game();
    game.loadSounds();

    document.getElementById("submitBtn").addEventListener("click", () => {
        game.handleGuess();
    });

    // Force Classic background on startup
    game.ui.setBackground("backgrounds/Classic.mp4");

    // Set initial background volume
    const bgVideo = document.getElementById("bgVideo");
    const volumeSlider = document.getElementById("volumeSlider");
    bgVideo.volume = volumeSlider.value / 100;

    // Allow background audio after first click
    document.addEventListener("click", () => {
        bgVideo.muted = false;
        bgVideo.volume = volumeSlider.value / 100;
    }, { once: true });
});
