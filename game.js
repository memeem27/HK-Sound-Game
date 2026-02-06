// ===============================
// Hollow Knight Sound Guessing Game
// Final merged version
// ===============================

function formatName(filename) {
    return filename
        .replace(".mp3", "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

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

class UI {
    constructor() {
        this.optionContainer = document.getElementById("choices");
        this.searchContainer = document.getElementById("searchContainer");
        this.searchInput = document.getElementById("searchInput");
        this.searchList = document.getElementById("searchList");

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
                this.optionContainer.value = name;
                this.searchInput.value = name;
            });
            this.searchList.appendChild(li);
        });
    }
}

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
            timerMode: "off"
        };

        this.ui = new UI();
        this.timer = new Timer(document.getElementById("timerDisplay"));
        this.soundManager = new SoundManager(document.getElementById("volumeSlider"));

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

        this.ui.searchInput.addEventListener("input", () => {
            const query = this.ui.searchInput.value.toLowerCase();
            const filtered = this.soundFiles
                .map(f => formatName(f))
                .filter(name => name.toLowerCase().includes(query));

            this.ui.populateSearchList(filtered);
        });

        this.ui.optionCount.addEventListener("input", e => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val > 0) {
                this.settings.optionCount = val;
            }
        });

        this.ui.timerMode.forEach(radio => {
            radio.addEventListener("change", e => {
                this.settings.timerMode = e.target.value;
                document.getElementById("timerDisplay").style.display =
                    e.target.value === "off" ? "none" : "block";
            });
        });

        document.getElementById("menuBtn").addEventListener("click", () => {
            document.getElementById("menuPanel").classList.toggle("open");
        });

        document.getElementById("leaderboardBtn").addEventListener("click", () => {
            document.getElementById("leaderboardPanel").classList.toggle("open");
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

        if (this.settings.timerMode !== "off") {
            this.timer.start();
        }

        this.currentSound = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
        this.correctName = formatName(this.currentSound);

        const count = Math.min(this.settings.optionCount, this.soundFiles.length);
        this.buildOptions(count);
    }

    buildOptions(count) {
        this.ui.clearOptions();

        const options = new Set([this.correctName]);

        while (options.size < count) {
            const random = this.soundFiles[Math.floor(Math.random() * this.soundFiles.length)];
            options.add(formatName(random));
        }

        const list = [...options].sort(() => Math.random() - 0.5);

        list.forEach(name => this.ui.addOption(name));

        if (this.settings.searchMode) {
            this.ui.populateSearchList(list);
        }
    }

    handleGuess() {
        const guess = this.ui.optionContainer.value;
        const correct = guess === this.correctName;

        if (this.settings.timerMode !== "off") {
            const time = this.timer.stop();
            if (correct && time < this.stats.fastestTime) {
                this.stats.fastestTime = time;
                this.ui.updateFastest(time);
            }
        }

        const result = document.getElementById("result");

        if (correct) {
            this.stats.wins++;
            document.getElementById("wins").textContent = this.stats.wins;
            this.stats.bestStreak++;
            this.ui.updateStreak(this.stats.bestStreak);
            result.textContent = "Correct!";
            result.style.color = "lightgreen";
        } else {
            this.stats.bestStreak = 0;
            this.ui.updateStreak(0);
            result.textContent = "Wrong! It was: " + this.correctName;
            result.style.color = "salmon";
        }

        this.newRound();
    }
}

let game = null;

window.gameStats = {
    get wins() { return game?.stats.wins ?? 0; },
    get fastestTime() { return game?.stats.fastestTime ?? Infinity; },
    get bestStreak() { return game?.stats.bestStreak ?? 0; },
    get timerMode() { return game?.settings.timerMode ?? "off"; },
    get roundsCompleted() { return game?.stats.roundsCompleted ?? 0; }
};

document.addEventListener("DOMContentLoaded", () => {
    game = new Game();
    game.loadSounds();

    document.getElementById("submitBtn").addEventListener("click", () => {
        game.handleGuess();
    });

    game.ui.setBackground("backgrounds/Classic.mp4");
});
