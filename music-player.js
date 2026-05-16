/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER - DEFAULT TRACK: SONG1.MP3
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    console.log("[ManuSMP Player] Initialisiere ausfallsicheren Musik-Player...");

    // song1.mp3 steht jetzt fest an Platz 1 der Playlist
    const localPlaylist = ["song1.mp3", "song2.mp3", "song3.mp3"];
    const backupPlaylist = [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    ];

    let audio = document.getElementById("bgMusic");
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "bgMusic";
        document.body.appendChild(audio);
    }

    let currentTrackIndex = 0;
    let isUsingBackup = false;

    try {
        const savedIndex = localStorage.getItem("currentTrackIndex");
        if (savedIndex !== null) currentTrackIndex = parseInt(savedIndex, 10);
        if (localStorage.getItem("isUsingBackup") === "true") isUsingBackup = true;
    } catch (e) { currentTrackIndex = 0; }

    if (isNaN(currentTrackIndex) || currentTrackIndex >= localPlaylist.length || currentTrackIndex < 0) {
        currentTrackIndex = 0;
    }

    audio.src = isUsingBackup ? backupPlaylist[currentTrackIndex] : localPlaylist[currentTrackIndex];
    audio.volume = 0.1; // Angenehme, leise Start-Lautstärke (10%)
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
        const currentSource = isUsingBackup ? backupPlaylist[currentTrackIndex] : localPlaylist[currentTrackIndex];
        console.log("[ManuSMP Player] Versuche abzuspielen:", currentSource);
        
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
            localStorage.setItem("musicPlaying", "true");
        }).catch(err => {
            if (!isUsingBackup) {
                isUsingBackup = true;
                localStorage.setItem("isUsingBackup", "true");
                audio.src = backupPlaylist[currentTrackIndex];
                audio.load();
                audio.play().then(() => {
                    mainBtn.innerText = "⏸";
                    localStorage.setItem("musicPlaying", "true");
                }).catch(e => console.error("[ManuSMP Player] Backup blockiert:", e));
            } else {
                mainBtn.innerText = "▶";
                localStorage.setItem("musicPlaying", "false");
            }
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
        isUsingBackup = false; 
        localStorage.setItem("isUsingBackup", "false");
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
