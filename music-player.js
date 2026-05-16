/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER - ULTRABACKUP FIX
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Audio-Element suchen oder erstellen, falls es im HTML fehlt
    let audio = document.getElementById("bgMusic");
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "bgMusic";
        document.body.appendChild(audio);
    }

    // 2. Deine Playlist (Stelle sicher, dass song1.mp3 etc. in deinem GitHub-Ordner liegen!)
    const playlist = [
        "song1.mp3",
        "song2.mp3",
        "song3.mp3"
    ];

    // 3. Track-Index aus dem Speicher laden und absichern
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

    // 4. Audio-Quelle setzen
    audio.src = playlist[currentTrackIndex];
    audio.volume = 0.3; // Angenehme Lautstärke
    audio.preload = "auto";

    // 5. Player-Leiste unten rechts im Dokument erstellen (falls noch nicht da)
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

    // 6. Ladezeitpunkt & Musikstatus wiederherstellen
    try {
        const savedTime = localStorage.getItem("musicTime");
        const wasPlaying = localStorage.getItem("musicPlaying");

        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        // Falls die Musik auf der vorherigen Seite lief, versuchen wir sie direkt zu starten
        if (wasPlaying === "true") {
            audio.play().then(() => {
                mainBtn.innerText = "⏸";
            }).catch(() => {
                console.log("Autoplay blockiert durch Browser. Warte auf User-Interaktion.");
                mainBtn.innerText = "▶";
            });
        }
    } catch (e) {
        console.error("Fehler beim Laden des Musik-Zustands:", e);
    }

    // 7. Funktion zum sicheren Abspielen
    function playAudio() {
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
            localStorage.setItem("musicPlaying", "true");
        }).catch(err => {
            console.error("Wiedergabe fehlgeschlagen:", err);
            mainBtn.innerText = "▶";
        });
    }

    // 8. Funktion zum Pausieren
    function pauseAudio() {
        audio.pause();
        mainBtn.innerText = "▶";
        localStorage.setItem("musicPlaying", "false");
    }

    // 9. Nächster Song (Skip)
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        audio.src = playlist[currentTrackIndex];
        audio.currentTime = 0;
        localStorage.setItem("currentTrackIndex", currentTrackIndex);
        playAudio();
    }

    // Wenn der aktuelle Song endet, automatisch skippen
    audio.addEventListener("ended", nextTrack);

    // Klick auf den Play/Pause Button
    mainBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    });

    // Klick auf den Skip-Button
    skipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextTrack();
    });

    // Lautstärke lauter
    volUp.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume < 0.9) audio.volume = Math.min(1.0, audio.volume + 0.1);
    });

    // Lautstärke leiser
    volDown.addEventListener("click", (e) => {
        e.stopPropagation();
        if (audio.volume > 0.1) audio.volume = Math.max(0.0, audio.volume - 0.1);
    });

    // Automatischer Start bei Klick irgendwo auf die Website (bricht die Browser-Blockade)
    document.addEventListener("click", () => {
        if (audio.paused) {
            const shouldPlay = localStorage.getItem("musicPlaying");
            if (shouldPlay === "true" || shouldPlay === null) {
                playAudio();
            }
        }
    }, { once: true });

    // Zustand vor dem Verlassen der Seite sichern
    window.addEventListener("beforeunload", () => {
        try {
            localStorage.setItem("musicTime", audio.currentTime);
            localStorage.setItem("musicPlaying", !audio.paused);
            localStorage.setItem("currentTrackIndex", currentTrackIndex);
        } catch (e) {}
    });
});
