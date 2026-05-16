/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER - NO BACKUP LINKS
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    console.log("[ManuSMP Player] Initialisiere reinen Musik-Player...");

    // Nur deine eigenen Dateien - absolut keine fremden Musik-Links mehr!
    const localPlaylist = ["song1.mp3", "song2.mp3", "song3.mp3"];

    let audio = document.getElementById("bgMusic");
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "bgMusic";
        document.body.appendChild(audio);
    }

    let currentTrackIndex = 0;

    try {
        const savedIndex = localStorage.getItem("currentTrackIndex");
        if (savedIndex !== null) currentTrackIndex = parseInt(savedIndex, 10);
    } catch (e) { currentTrackIndex = 0; }

    if (isNaN(currentTrackIndex) || currentTrackIndex >= localPlaylist.length || currentTrackIndex < 0) {
        currentTrackIndex = 0;
    }

    audio.src = localPlaylist[currentTrackIndex];
    audio.volume = 0.1; // 10% Lautstärke
    audio.preload = "auto";

    let musicContainer = document.getElementById("music-container");
    if (!musicContainer) {
        musicContainer = document.createElement("div");
        musicContainer.id = "music-container";
        musicContainer.innerHTML = `
            <button id="music-main-btn" type="button">▶</button>
            <button class="music-sub-btn" id="music-skip-btn" type="button">⏭</button>
            <button class="music-sub-btn" id="vol-down" type="button">-</button>
            <button class="music-sub-btn" id="vol-up" type="button">+</button>
        `;
        document.body.appendChild(musicContainer);
    }

    const mainBtn = document.getElementById("music-main-btn");
    const skipBtn = document.getElementById("music-skip-btn");
    const volDown = document.getElementById("vol-down");
    const volUp = document.getElementById("vol-up");

    try {
        const savedTime = localStorage.getItem("musicTime");
        const wasPlaying = localStorage.getItem("musicPlaying");
        if (savedTime && !isNaN(parseFloat(savedTime))) audio.currentTime = parseFloat(savedTime);
        if (wasPlaying === "true") playAudio();
    } catch (e) {}

    function playAudio() {
        console.log("[ManuSMP Player] Spiele Track ab:", localPlaylist[currentTrackIndex]);
        
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
            localStorage.setItem("musicPlaying", "true");
        }).catch(err => {
            console.log("[ManuSMP Player] Wiedergabe wartet auf Klick oder Datei fehlt.");
            mainBtn.innerText = "▶";
            localStorage.setItem("musicPlaying", "false");
        });
    }

    function pauseAudio() {
        audio.pause();
        mainBtn.innerText = "▶";
        localStorage.setItem("musicPlaying", "false");
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % localPlaylist.length;
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
        audio.src = localPlaylist[currentTrackIndex];
        audio.load();
        playAudio();
    }

    audio.addEventListener("ended", nextTrack);

    mainBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.paused) { playAudio(); } else { pauseAudio(); }
    });

    skipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextTrack();
    });

    volUp.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume < 0.95) audio.volume = Math.min(1.0, audio.volume + 0.05);
    });

    volDown.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume > 0.05) audio.volume = Math.max(0.0, audio.volume - 0.05);
    });

    document.addEventListener("click", () => {
        const shouldPlay = localStorage.getItem("musicPlaying");
        if (audio.paused && (shouldPlay === "true" || shouldPlay === null)) {
            playAudio();
        }
    }, { once: true });

    window.addEventListener("beforeunload", () => {
        try {
            localStorage.setItem("musicTime", audio.currentTime);
            localStorage.setItem("musicPlaying", !audio.paused);
            localStorage.setItem("currentTrackIndex", currentTrackIndex);
        } catch (e) {}
    });
});
