/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER WITH REPAIRED PLAYLIST & AUTO-START
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bgMusic");
    if (!audio) return;

    // DEINE PLAYLIST (Achte darauf, dass song1.mp3, song2.mp3, song3.mp3 auf GitHub liegen!)
    const playlist = [
        "song1.mp3",
        "song2.mp3",
        "song3.mp3"
    ];

    // Aktuellen Track-Index laden
    let currentTrackIndex = parseInt(localStorage.getItem("currentTrackIndex")) || 0;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;

    // Audio initialisieren
    audio.src = playlist[currentTrackIndex];
    audio.volume = 0.3; 

    // Steuerungs-Panel erstellen, falls es fehlt
    if (!document.getElementById("music-container")) {
        const musicContainer = document.createElement("div");
        musicContainer.id = "music-container";
        musicContainer.innerHTML = `
            <button id="music-main-btn">▶</button>
            <button class="music-sub-btn" id="music-skip-btn">⏭</button>
            <button class="music-sub-btn" id="vol-down">-</button>
            <button class="music-sub-btn" id="vol-up">+</button>
        `;
        document.body.appendChild(musicContainer);
    }

    const mainBtn = document.getElementById("music-main-btn");
    const skipBtn = document.getElementById("music-skip-btn");
    const volDown = document.getElementById("vol-down");
    const volUp = document.getElementById("vol-up");

    // Zustand speichern vor dem Seitenwechsel
    function saveMusicState() {
        localStorage.setItem("musicTime", audio.currentTime);
        localStorage.setItem("musicPlaying", !audio.paused);
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
    }

    // Zustand laden
    const savedTime = localStorage.getItem("musicTime");
    const wasPlaying = localStorage.getItem("musicPlaying");

    if (savedTime && localStorage.getItem("lastPageTrackIndex") === String(currentTrackIndex)) {
        audio.currentTime = parseFloat(savedTime);
    }
    localStorage.setItem("lastPageTrackIndex", currentTrackIndex);

    function playTrack() {
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
            localStorage.setItem("musicPlaying", "true");
        }).catch(err => {
            console.log("Autoplay blockiert. Warte auf Klick.");
            mainBtn.innerText = "▶";
        });
    }

    // Wenn es vorher lief, versuchen abzuspielen
    if (wasPlaying === "true") {
        playTrack();
    }

    // SKIP-FUNKTION (Nächster Song)
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        audio.src = playlist[currentTrackIndex];
        audio.currentTime = 0;
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
        playTrack();
    }

    // Wenn der Song vorbei ist -> Nächster Song
    audio.addEventListener("ended", nextTrack);

    // Klick auf Play/Pause Button
    mainBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.paused) {
            playTrack();
        } else {
            audio.pause();
            mainBtn.innerText = "▶";
            localStorage.setItem("musicPlaying", "false");
        }
    });

    // Klick auf Skip Button
    skipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextTrack();
    });

    // Lautstärke Regler
    volUp.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume < 0.9) audio.volume = Math.min(1.0, audio.volume + 0.1);
    });

    volDown.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume > 0.1) audio.volume = Math.max(0.0, audio.volume - 0.1);
    });

    // WICHTIG: Sobald der User IRGENDWO auf die Seite klickt, startet der Player, falls er laufen sollte
    document.body.addEventListener("click", () => {
        if (audio.paused && (localStorage.getItem("musicPlaying") === "true" || localStorage.getItem("musicPlaying") === null)) {
            playTrack();
        }
    }, { once: true });

    window.addEventListener("beforeunload", saveMusicState);
});
