/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER - EMERGENCY BULLETPROOF FIX
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("[ManuSMP Player] Initialisiere Musik-Player...");

    // 1. Deine Playlist (Stelle sicher, dass diese Dateien EXAKT so auf GitHub liegen!)
    const playlist = [
        "song1.mp3",
        "song2.mp3",
        "song3.mp3"
    ];

    // 2. Audio-Element im HTML finden oder sauber neu erstellen
    let audio = document.getElementById("bgMusic");
    if (!audio) {
        console.log("[ManuSMP Player] <audio>-Tag fehlte, erstelle es neu...");
        audio = document.createElement("audio");
        audio.id = "bgMusic";
        document.body.appendChild(audio);
    }

    // 3. Track-Index aus dem Speicher holen
    let currentTrackIndex = 0;
    try {
        const savedIndex = localStorage.getItem("currentTrackIndex");
        if (savedIndex !== null) {
            currentTrackIndex = parseInt(savedIndex, 10);
        }
    } catch (e) {
        currentTrackIndex = 0;
    }

    if (isNaN(currentTrackIndex) || currentTrackIndex >= playlist.length || currentTrackIndex < 0) {
        currentTrackIndex = 0;
    }

    // 4. Audio-Quelle initialisieren
    audio.src = playlist[currentTrackIndex];
    audio.volume = 0.3; // Angenehme Lautstärke
    audio.preload = "auto";

    // 5. Interface bauen, falls es noch nicht existiert
    let musicContainer = document.getElementById("music-container");
    if (!musicContainer) {
        musicContainer = document.createElement("div");
        musicContainer.id = "music-container";
        musicContainer.innerHTML = `
            <button id="music-main-btn" type="button" style="font-family: inherit;">▶</button>
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

    // Zustand laden
    try {
        const savedTime = localStorage.getItem("musicTime");
        const wasPlaying = localStorage.getItem("musicPlaying");

        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        if (wasPlaying === "true") {
            console.log("[ManuSMP Player] Versuche Autoplay fortzusetzen...");
            audio.play().then(() => {
                mainBtn.innerText = "⏸";
            }).catch(() => {
                console.log("[ManuSMP Player] Autoplay blockiert. Warte auf Klick.");
                mainBtn.innerText = "▶";
            });
        }
    } catch (e) {
        console.error("[ManuSMP Player] Fehler beim Laden des Zustands:", e);
    }

    // 6. Zentrale Funktionen für Play / Pause / Skip
    function playAudio() {
        console.log("[ManuSMP Player] Versuche Song abzuspielen:", playlist[currentTrackIndex]);
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
            localStorage.setItem("musicPlaying", "true");
            console.log("[ManuSMP Player] Musik läuft erfolgreich!");
        }).catch(err => {
            console.error("[ManuSMP Player] Wiedergabe vom Browser verweigert:", err);
            mainBtn.innerText = "▶";
            localStorage.setItem("musicPlaying", "false");
        });
    }

    function pauseAudio() {
        console.log("[ManuSMP Player] Musik pausiert.");
        audio.pause();
        mainBtn.innerText = "▶";
        localStorage.setItem("musicPlaying", "false");
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        console.log("[ManuSMP Player] Skippe zu Track Index:", currentTrackIndex);
        audio.src = playlist[currentTrackIndex];
        audio.currentTime = 0;
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
        playAudio();
    }

    // Event-Listener für das Ende eines Songs
    audio.addEventListener("ended", () => {
        console.log("[ManuSMP Player] Song zu Ende.");
        nextTrack();
    });

    // 7. Klick-Events (mit Stoppen der Weiterleitung, damit nichts crashed)
    mainBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    });

    skipBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextTrack();
    });

    volUp.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (audio.volume < 0.9) audio.volume = Math.min(1.0, audio.volume + 0.1);
        console.log("[ManuSMP Player] Lautstärke:", audio.volume);
    });

    volDown.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (audio.volume > 0.1) audio.volume = Math.max(0.0, audio.volume - 0.1);
        console.log("[ManuSMP Player] Lautstärke:", audio.volume);
    });

    // 8. Globaler Klick-Auffänger (Sobald User IRGENDWO hinklickt, startet die Musik, falls sie laufen sollte)
    document.addEventListener("click", () => {
        const shouldPlay = localStorage.getItem("musicPlaying");
        if (audio.paused && (shouldPlay === "true" || shouldPlay === null)) {
            console.log("[ManuSMP Player] Erster User-Klick registriert. Starte Musik...");
            playAudio();
        }
    }, { once: true });

    // Zustand vor dem Verlassen speichern
    window.addEventListener("beforeunload", () => {
        try {
            localStorage.setItem("musicTime", audio.currentTime);
            localStorage.setItem("musicPlaying", !audio.paused);
            localStorage.setItem("currentTrackIndex", currentTrackIndex);
        } catch (e) {}
    });
});
