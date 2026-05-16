/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER WITH REPAIRED PLAYLIST & SKIP FUNCTION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bgMusic");
    if (!audio) return;

    // DEINE PLAYLIST (Hier einfach die Dateinamen deiner Songs eintragen)
    const playlist = [
        "song1.mp3",
        "song2.mp3",
        "song3.mp3"
    ];

    // Aktuellen Song-Index aus dem Speicher laden oder bei 0 anfangen
    let currentTrackIndex = parseInt(localStorage.getItem("currentTrackIndex")) || 0;
    
    // Falls der Index ungültig ist, auf 0 zurücksetzen
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;

    // Erste Quelle setzen
    audio.src = playlist[currentTrackIndex];
    audio.volume = 0.3; // Angenehme Lautstärke

    // Steuerungs-Panel unten rechts erstellen, falls es noch fehlt
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

    // Musik-Zustand für Seitenwechsel sichern
    function saveMusicState() {
        localStorage.setItem("musicTime", audio.currentTime);
        localStorage.setItem("musicPlaying", !audio.paused);
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
    }

    // Gespeicherten Zustand laden
    const savedTime = localStorage.getItem("musicTime");
    const wasPlaying = localStorage.getItem("musicPlaying");

    if (savedTime && localStorage.getItem("lastPageTrackIndex") === String(currentTrackIndex)) {
        audio.currentTime = parseFloat(savedTime);
    }
    localStorage.setItem("lastPageTrackIndex", currentTrackIndex);

    function tryPlayAudio() {
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
        }).catch(err => {
            console.log("Browser blockiert Autoplay. Warte auf User-Interaktion.");
            mainBtn.innerText = "▶";
        });
    }

    if (wasPlaying === "true") {
        // Da wir das Autoplay blockieren, müssen wir auf den ersten Klick warten
        document.body.addEventListener("click", () => {
            if (localStorage.getItem("musicPlaying") === "true" && audio.paused) {
                tryPlayAudio();
            }
        }, { once: true });
    }

    // Song wechseln (Skip)
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length; // Springt nach dem letzten Song wieder zu 0
        audio.src = playlist[currentTrackIndex];
        audio.currentTime = 0;
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
        
        // Direkt abspielen
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
            localStorage.setItem("musicPlaying", "true");
        }).catch(() => {
            mainBtn.innerText = "▶";
        });
    }

    // Wenn ein Song von alleine zu Ende geht -> Nächster Song
    audio.addEventListener("ended", nextTrack);

    // Play / Pause Button
    mainBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Klick nicht an body weiterleiten
        if (audio.paused) {
            audio.play().then(() => {
                mainBtn.innerText = "⏸";
                localStorage.setItem("musicPlaying", "true");
            });
        } else {
            audio.pause();
            mainBtn.innerText = "▶";
            localStorage.setItem("musicPlaying", "false");
        }
    });

    // Skip Button Klick
    skipBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Klick nicht an body weiterleiten
        nextTrack();
    });

    // Lautstärke Buttons
    volUp.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume < 0.9) audio.volume = Math.min(1.0, audio.volume + 0.1);
    });

    volDown.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume > 0.1) audio.volume = Math.max(0.0, audio.volume - 0.1);
    });

    window.addEventListener("beforeunload", saveMusicState);
});
