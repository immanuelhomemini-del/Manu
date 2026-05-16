(function () {
    var music = document.getElementById('bgMusic');
    if (!music) {
        music = document.createElement('audio');
        music.id = 'bgMusic';
        music.loop = true;
        var src = document.createElement('source');
        src.src = 'background.mp3';
        src.type = 'audio/mpeg';
        music.appendChild(src);
        document.body.appendChild(music);
    }
    music.volume = 0.15;

    var btn = document.createElement('button');
    btn.id = 'music-player-btn';
    btn.setAttribute('aria-label', 'Musik Play/Pause');
    btn.innerHTML =
        '<svg id="mp-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg id="mp-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    document.body.appendChild(btn);

    var playing = false;

    function updateIcon() {
        document.getElementById('mp-play').style.display = playing ? 'none' : 'block';
        document.getElementById('mp-pause').style.display = playing ? 'block' : 'none';
    }

    function tryPlay() {
        music.play().then(function () {
            playing = true;
            localStorage.setItem('musicPlaying', '1');
            updateIcon();
        }).catch(function () {});
    }

    btn.addEventListener('click', function () {
        if (playing) {
            music.pause();
            playing = false;
            localStorage.setItem('musicPlaying', '0');
            updateIcon();
        } else {
            tryPlay();
        }
    });

    if (localStorage.getItem('musicPlaying') === '1') {
        document.addEventListener('click', function onFirst() {
            tryPlay();
            document.removeEventListener('click', onFirst);
        }, { once: true });
    }
})();
