document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTS
    const bgVideo = document.getElementById("bgVideo");
    const bgSelect = document.getElementById("bgSelect");
    const volumeSlider = document.getElementById("volumeSlider");
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const menuBtn = document.getElementById("menuBtn");
    const leaderboardPanel = document.getElementById("leaderboardPanel");
    const menuPanel = document.getElementById("menuPanel");
    const playBtn = document.getElementById("playBtn");
    const submitBtn = document.getElementById("submitBtn");
    const choices = document.getElementById("choices");
    const searchToggle = document.getElementById("searchToggle");
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");
    const searchList = document.getElementById("searchList");

    // INITIAL STATE
    searchContainer.style.display = "none";
    leaderboardPanel.style.display = "none";
    menuPanel.style.display = "none";

    // BACKGROUND LOADER
    function updateBackground() {
        const file = bgSelect.value;
        if (file) {
            bgVideo.src = file;
            bgVideo.volume = volumeSlider.value / 100;
            bgVideo.play();
        }
    }

    bgSelect.addEventListener("change", updateBackground);
    volumeSlider.addEventListener("input", () => {
        bgVideo.volume = volumeSlider.value / 100;
    });

    // Load default background
    updateBackground();

    // MENU TOGGLE
    menuBtn.addEventListener("click", () => {
        menuPanel.style.display =
            menuPanel.style.display === "none" ? "block" : "none";
        leaderboardPanel.style.display = "none";
    });

    // LEADERBOARD TOGGLE
    leaderboardBtn.addEventListener("click", () => {
        leaderboardPanel.style.display =
            leaderboardPanel.style.display === "none" ? "block" : "none";
        menuPanel.style.display = "none";
    });

    // SEARCH TOGGLE
    searchToggle.addEventListener("click", () => {
        searchContainer.style.display =
            searchContainer.style.display === "none" ? "block" : "none";
    });

    // PLAY SOUND (placeholder)
    playBtn.addEventListener("click", () => {
        console.log("Play sound triggered");
        // Your actual sound logic goes here
    });

    // SUBMIT GUESS (placeholder)
    submitBtn.addEventListener("click", () => {
        console.log("Submit guess triggered");
        // Your actual guess logic goes here
    });

});
