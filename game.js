// ===============================
// Hollow Knight Sound Guessing Game
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
// Theme Manager
// ===============================
class ThemeManager {
    constructor() {
        this.themes = {
            "Classic": {
                menuBg: "rgba(13, 13, 22, 0.95)",
                lbBg: "rgba(13, 13, 22, 0.97)",
                boxBg: "#1a1a2e",
                accentColor: "#6a6aff",
                accentGlow: "rgba(120, 120, 255, 0.4)",
                textColor: "#e6e6f0",
                textGlow: "#6a6aff",
                buttonBg: "#2a2a4a",
                buttonBgHover: "#3a3a6a",
                inputBg: "#2a2a4a"
            },
            "Godhome": {
                menuBg: "rgba(25, 22, 15, 0.95)",
                lbBg: "rgba(25, 22, 15, 0.97)",
                boxBg: "#2e2a1a",
                accentColor: "#ffd700",
                accentGlow: "rgba(255, 215, 0, 0.4)",
                textColor: "#fff8dc",
                textGlow: "#ffd700",
                buttonBg: "#3d3520",
                buttonBgHover: "#4d4530",
                inputBg: "#3d3520"
            },
            "Hidden Dreams": {
                menuBg: "rgba(20, 13, 22, 0.95)",
                lbBg: "rgba(20, 13, 22, 0.97)",
                boxBg: "#2a1a2e",
                accentColor: "#ff6aff",
                accentGlow: "rgba(255, 106, 255, 0.4)",
                textColor: "#f0e6f0",
                textGlow: "#ff6aff",
                buttonBg: "#3a2a4a",
                buttonBgHover: "#4a3a6a",
                inputBg: "#3a2a4a"
            },
            "Infected": {
                menuBg: "rgba(22, 18, 10, 0.95)",
                lbBg: "rgba(22, 18, 10, 0.97)",
                boxBg: "#2e2410",
                accentColor: "#ff8c00",
                accentGlow: "rgba(255, 140, 0, 0.4)",
                textColor: "#ffe6cc",
                textGlow: "#ff8c00",
                buttonBg: "#3d3020",
                buttonBgHover: "#4d4030",
                inputBg: "#3d3020"
            },
            "Lifeblood": {
                menuBg: "rgba(10, 18, 22, 0.95)",
                lbBg: "rgba(10, 18, 22, 0.97)",
                boxBg: "#1a2428",
                accentColor: "#00d4ff",
                accentGlow: "rgba(0, 212, 255, 0.4)",
                textColor: "#e6f9ff",
                textGlow: "#00d4ff",
                buttonBg: "#1a3540",
                buttonBgHover: "#2a4550",
                inputBg: "#1a3540"
            },
            "SteelSoul": {
                menuBg: "rgba(15, 18, 20, 0.95)",
                lbBg: "rgba(15, 18, 20, 0.97)",
                boxBg: "#1a2025",
                accentColor: "#7090a0",
                accentGlow: "rgba(112, 144, 160, 0.4)",
                textColor: "#e0e8f0",
                textGlow: "#7090a0",
                buttonBg: "#2a3540",
                buttonBgHover: "#3a4550",
                inputBg: "#2a3540"
            },
            "The Grimm Troupe": {
                menuBg: "rgba(18, 8, 8, 0.95)",
                lbBg: "rgba(18, 8, 8, 0.97)",
                boxBg: "#220a0a",
                accentColor: "#ff3333",
                accentGlow: "rgba(255, 51, 51, 0.4)",
                textColor: "#ffe6e6",
                textGlow: "#ff3333",
                buttonBg: "#3a1a1a",
                buttonBgHover: "#4a2a2a",
                inputBg: "#3a1a1a"
            },
            "Void": {
                menuBg: "rgba(8, 8, 12, 0.95)",
                lbBg: "rgba(8, 8, 12, 0.97)",
                boxBg: "#0f0f15",
                accentColor: "#4a4aaa",
                accentGlow: "rgba(74, 74, 170, 0.4)",
                textColor: "#d0d0e0",
                textGlow: "#4a4aaa",
                buttonBg: "#1a1a3a",
                buttonBgHover: "#2a2a4a",
                inputBg: "#1a1a3a"
            },
            "Voidheart": {
                menuBg: "rgba(12, 8, 15, 0.95)",
                lbBg: "rgba(12, 8, 15, 0.97)",
                boxBg: "#18101e",
                accentColor: "#9a6aff",
                accentGlow: "rgba(154, 106, 255, 0.4)",
                textColor: "#e6d9f0",
                textGlow: "#9a6aff",
                buttonBg: "#2a1a3a",
                buttonBgHover: "#3a2a4a",
                inputBg: "#2a1a3a"
            },
            "Zote": {
                menuBg: "rgba(18, 15, 20, 0.95)",
                lbBg: "rgba(18, 15, 20, 0.97)",
                boxBg: "#252028",
                accentColor: "#aa88cc",
                accentGlow: "rgba(170, 136, 204, 0.4)",
                textColor: "#e8e4ec",
                textGlow: "#aa88cc",
                buttonBg: "#352a40",
                buttonBgHover: "#453a50",
                inputBg: "#352a40"
            }
        };
    }

    applyTheme(backgroundName) {
        const themeName = backgroundName.split("/").pop().replace(".mp4", "");
        const theme = this.themes[themeName] || this.themes["Classic"];

        const root = document.documentElement;
        root.style.setProperty("--menu-bg", theme.menuBg);
        root.style.setProperty("--lb-bg", theme.lbBg);
        root.style.setProperty("--box-bg", theme.boxBg);
        root.style.setProperty("--accent-color", theme.accentColor);
        root.style.setProperty("--accent-glow", theme.accentGlow);
        root.style.setProperty("--text-color", theme.textColor);
        root.style.setProperty("--text-glow", theme.textGlow);
        root.style.setProperty("--button-bg", theme.buttonBg);
        root.style.setProperty("--button-bg-hover", theme.buttonBgHover);
        root.style.setProperty("--input-bg", theme.inputBg);
    }
}

// ===============================
// Sound Manager
// ===============================
class SoundManager {
    constructor(volumeSlider, volumePercent) {
        this.audio = new Audio();
        this.volumeSlider = volumeSlider;
        this.volumePercent = volumePercent;
        this.audio.volume = volumeSlider.value / 100;

        volumeSlider.addEventListener("input", () => {
            this.audio.volume = volumeSlider.value / 100;
            this.updateVolumeDisplay();
        });
        
        // Set initial display
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        if (this.volumePercent) {
            this.volumePercent.textContent = `(${this.volumeSlider.value}%)`;
        }
    }

    play(filePath) {
        this.audio.src = filePath;
        this.audio.play().catch(() => {});
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
        clearInterval(this.interval);

        if (typeof durationSeconds === "number" && durationSeconds > 0) {
            this.duration = durationSeconds;
            this.time = durationSeconds;
        } else {
            this.duration = null;
            this.time = 0;
        }

        this.updateDisplay();

        this.interval = setInterval(() => {
            if (this.duration !== null) {
                this.time = Math.max(0, this.time - 0.1);
                this.updateDisplay();
                if (this.time <= 0) {
                    clearInterval(this.interval);
                    if (typeof this.onTimeout === "function") {
                        this.onTimeout();
                    }
                }
            } else {
                this.time += 0.1;
                this.updateDisplay();
            }
        }, 100);
    }

    stop() {
        clearInterval(this.interval);
        let elapsed;
        if (this.duration !== null) {
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
        this.timerModeRadios = document.getElementsByName("timerMode");
        this.timerDifficultyRadios = document.getElementsByName("timerDifficulty");
        this.timerDifficultyDiv = document.getElementById("timerDifficulty");
        this.volumePercent = document.getElementById("volumePercent");
    }

    async setBackground(src, themeManager) {
        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo && src) {
            bgVideo.style.opacity = "0";
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            bgVideo.src = src;
            bgVideo.volume = document.getElementById("volumeSlider").value / 100;
            bgVideo.load();
            
            if (themeManager) {
                themeManager.applyTheme(src);
            }
            
            bgVideo.play().catch(() => {
                const playOnInteract = () => {
                    bgVideo.play();
                    document.removeEventListener("click", playOnInteract);
                };
                document.addEventListener("click", playOnInteract);
            });
            
            bgVideo.style.opacity = "1";
        }
    }

    updateVolumeDisplay(value) {
        if (this.volumePercent) {
            this.volumePercent.textContent = `(${value}%)`;
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
                this.searchInput.value = name;
                this.searchInput.dataset.selected = name;
                this.searchList.innerHTML = "";
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
            timerEnabled: false,
            timerDifficulty: "easy"
        };

        this.ui = new UI();
        this.themeManager = new ThemeManager();
        this.timer = new Timer(document.getElementById("timerDisplay"));
        this.timer.onTimeout = () => this.handleTimeout();
        this.soundManager = new SoundManager(
            document.getElementById("volumeSlider"),
            document.getElementById("volumePercent")
        );

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
        document.getElementById("playBtn").addEventListener("click", () => {
            if (this.currentSound) {
                this.soundManager.play(this.soundFolder + this.currentSound);
            }
        });

        this.ui.backgroundSelect.addEventListener("change", e => {
            this.ui.setBackground(e.target.value, this.themeManager);
        });

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

        this.ui.searchInput.addEventListener("focus", () => {
            const allOptions = this.soundFiles.map(f => formatName(f));
            this.ui.populateSearchList(allOptions);
        });

        this.ui.searchInput.addEventListener("input", () => {
            const query = this.ui.searchInput.value.toLowerCase();
            delete this.ui.searchInput.dataset.selected;
            
            const filtered = this.soundFiles
                .map(f => formatName(f))
                .filter(name => name.toLowerCase().includes(query));

            this.ui.populateSearchList(filtered);
        });

        this.ui.optionCount.addEventListener("input", e => {
            const val = parseInt(e.target.value, 10);
            if (isNaN(val)) return;

            let clamped = Math.max(5, val);

            if (this.soundFiles.length > 0) {
                clamped = Math.min(clamped, this.soundFiles.length);
            }

            this.settings.optionCount = clamped;
            e.target.value = clamped;

            if (this.soundFiles.length > 0) {
                this.newRound();
            }
        });

        this.ui.timerModeRadios.forEach(radio => {
            radio.addEventListener("change", e => {
                const timerDisplay = document.getElementById("timerDisplay");
                
                if (e.target.value === "off") {
                    this.settings.timerEnabled = false;
                    this.ui.timerDifficultyDiv.style.display = "none";
                    timerDisplay.style.display = "none";
                } else if (e.target.value === "on") {
                    this.settings.timerEnabled = true;
                    this.ui.timerDifficultyDiv.style.display = "block";
                    timerDisplay.style.display = "block";
                    
                    for (const diffRadio of this.ui.timerDifficultyRadios) {
                        if (diffRadio.checked) {
                            this.settings.timerDifficulty = diffRadio.value;
                            break;
                        }
                    }
                    
                    if (this.soundFiles.length > 0) {
                        this.newRound();
                    }
                }
            });
        });

        this.ui.timerDifficultyRadios.forEach(radio => {
            radio.addEventListener("change", e => {
                if (this.settings.timerEnabled) {
                    this.settings.timerDifficulty = e.target.value;
                    
                    if (this.soundFiles.length > 0) {
                        this.newRound();
                    }
                }
            });
        });

        document.getElementById("menuBtn").addEventListener("click", () => {
            document.getElementById("menuPanel").classList.toggle("open");
        });

        document.getElementById("leaderboardBtn").addEventListener("click", () => {
            document.getElementById("leaderboardPanel").classList.toggle("open");
        });

        const bgVideo = document.getElementById("bgVideo");
        const volumeSlider = document.getElementById("volumeSlider");

        volumeSlider.addEventListener("input", () => {
            bgVideo.volume = volumeSlider.value / 100;
            this.ui.updateVolumeDisplay(volumeSlider.value);
        });
    }

    async loadSounds() {
        try {
            const response = await fetch(this.soundFolder + "list.json");
            if (!response.ok) {
                throw new Error("Failed to load sound list");
            }
            this.soundFiles = await response.json();
            if (!Array.isArray(this.soundFiles) || this.soundFiles.length === 0) {
                throw new Error("Invalid sound list");
            }
            this.ui.optionCount.max = this.soundFiles.length;
            this.newRound();
        } catch (error) {
            alert("Error loading sounds. Please refresh the page.");
        }
    }

    newRound() {
        this.stats.roundsCompleted++;

        if (this.ui.searchInput) {
            this.ui.searchInput.value = "";
            delete this.ui.searchInput.dataset.selected;
            this.ui.searchList.innerHTML = "";
        }

        if (this.settings.timerEnabled) {
            const duration = this.getTimerDuration();
            this.timer.start(duration);
        }

        this.currentSound = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
        this.correctName = formatName(this.currentSound);

        const count = Math.min(this.settings.optionCount, this.soundFiles.length);
        this.buildOptions(count);
    }

    getTimerDuration() {
        switch (this.settings.timerDifficulty) {
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
        if (!this.settings.timerEnabled) return;
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

        return `Streak this run: ${streak}\nFastest time this run: ${fastestText}\nAverage time this run: ${avgText}`;
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
        if (!this.settings.timerEnabled) return;
        this.showScoreModal("Time's Up!");
    }

    handleGuess() {
        let guess;
        
        if (this.settings.searchMode) {
            guess = this.ui.searchInput.dataset.selected;
        } else {
            guess = this.ui.optionContainer.value;
        }

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
        if (this.settings.timerEnabled) {
            time = this.timer.stop();
            if (correct && time < this.stats.fastestTime) {
                this.stats.fastestTime = time;
            }
        }

        const result = document.getElementById("result");

        if (correct) {
            this.stats.wins++;
            this.stats.bestStreak++;
            
            if (this.settings.timerEnabled) {
                if (this.settings.timerDifficulty === "easy") {
                    this.stats.easyModeWins++;
                } else if (this.settings.timerDifficulty === "medium") {
                    this.stats.mediumModeWins++;
                } else if (this.settings.timerDifficulty === "hard") {
                    this.stats.hardModeWins++;
                }
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

            if (this.settings.timerEnabled) {
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

window.gameStats = {
    get wins() { return game?.stats.wins ?? 0; },
    get fastestTime() { return game?.stats.fastestTime ?? Infinity; },
    get bestStreak() { return game?.stats.bestStreak ?? 0; },
    get timerMode() { 
        if (!game?.settings.timerEnabled) return "off";
        return game?.settings.timerDifficulty ?? "off";
    },
    get roundsCompleted() { return game?.stats.roundsCompleted ?? 0; },
    get easyModeWins() { return game?.stats.easyModeWins ?? 0; },
    get mediumModeWins() { return game?.stats.mediumModeWins ?? 0; },
    get hardModeWins() { return game?.stats.hardModeWins ?? 0; }
};

document.addEventListener("DOMContentLoaded", () => {
    game = new Game();
    game.loadSounds();

    document.getElementById("submitBtn").addEventListener("click", () => {
        game.handleGuess();
    });

    game.ui.setBackground("backgrounds/Classic.mp4", game.themeManager);

    const bgVideo = document.getElementById("bgVideo");
    const volumeSlider = document.getElementById("volumeSlider");
    bgVideo.volume = volumeSlider.value / 100;

    document.addEventListener("click", () => {
        bgVideo.muted = false;
        bgVideo.volume = volumeSlider.value / 100;
    }, { once: true });
});
