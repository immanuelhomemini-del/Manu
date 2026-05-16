/* ==========================================================================
   MANUSMP GLOBAL MUSIC PLAYER WITH PERSISTENT STATE & AUTOPLAY FIX
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("bgMusic");
    
    // Verhindern, dass das Skript abbricht, falls das Audio-Element fehlt
    if (!audio) return;

    // Lautstärke standardmäßig angenehm leise einstellen (30%)
    audio.volume = 0.3;

    // Erstelle das Control-Panel unten rechts dynamisch, falls nicht vorhanden
    if (!document.getElementById("music-container")) {
        const musicContainer = document.createElement("div");
        musicContainer.id = "music-container";
        musicContainer.innerHTML = `
            <button id="music-main-btn">▶</button>
            <button class="music-sub-btn" id="vol-down">-</button>
            <button class="music-sub-btn" id="vol-up">+</button>
        `;
        document.body.appendChild(musicContainer);
    }

    const mainBtn = document.getElementById("music-main-btn");
    const volDown = document.getElementById("vol-down");
    const volUp = document.getElementById("vol-up");

    // Funktion zum Speichern der aktuellen Musik-Zeit vor dem Seitenwechsel
    function saveMusicState() {
        localStorage.setItem("musicTime", audio.currentTime);
        localStorage.setItem("musicPlaying", !audio.paused);
    }

    // Zustand beim Laden der Seite wiederherstellen
    const savedTime = localStorage.getItem("musicTime");
    const wasPlaying = localStorage.getItem("musicPlaying");

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    // Funktion, um das Audio sicher abzuspielen (Browser-Autoplay-Block umgehen)
    function tryPlayAudio() {
        audio.play().then(() => {
            mainBtn.innerText = "⏸";
        }).catch(err => {
            console.log("Browser blockiert Autoplay. Warte auf User-Klick.");
            mainBtn.innerText = "▶";
        });
    }

    // Wenn es vorher lief, versuchen abzuspielen
    if (wasPlaying === "true") {
        tryPlayAudio();
    }

    // Event-Listener für den Main-Button (Play / Pause)
    mainBtn.addEventListener("click", () => {
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

    // Lautstärke-Steuerung (+ / - Buttons)
    volUp.addEventListener("click", () => {
        if (audio.volume < 0.9) {
            audio.volume = Math.min(1.0, audio.volume + 0.1);
        }
    });

    volDown.addEventListener("click", () => {
        if (audio.volume > 0.1) {
            audio.volume = Math.max(0.0, audio.volume - 0.1);
        }
    });

    // WICHTIG: Sobald der User irgendwo auf die Seite klickt, versuchen wir abzuspielen,
    // falls der Zustand eigentlich auf "playing" stand.
    document.body.addEventListener("click", () => {
        if (localStorage.getItem("musicPlaying") === "true" && audio.paused) {
            tryPlayAudio();
        }
    }, { once: true }); // Führt sich nur beim ersten Klick aus

    // Vor dem Verlassen der Seite Zustand sichern
    window.addEventListener("beforeunload", saveMusicState);
});
