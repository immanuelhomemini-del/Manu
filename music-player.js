(function () {
    // Playlist (Läuft über background.mp3, track2.mp3 und track3.mp3)
    var playlist = [
        'background.mp3',
        'track2.mp3',
        'track3.mp3'
    ];
    
    var currentTrackIndex = parseInt(localStorage.getItem('currentTrackIndex')) || 0;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;

    var music = document.getElementById('bgMusic');
    if (!music) {
        music = document.createElement('audio');
        music.id = 'bgMusic';
        document.body.appendChild(music);
    }
    music.volume = 0.15;

    function loadTrack(index) {
        music.src = playlist[index];
        localStorage.setItem('currentTrackIndex', index);
    }
    
    loadTrack(currentTrackIndex);

    var container = document.createElement('div');
    container.id = 'music-container';
    
    var prevBtn = document.createElement('button');
    prevBtn.className = 'music-sub-btn';
    prevBtn.innerHTML = '‹';

    var mainBtn = document.createElement('button');
    mainBtn.id = 'music-main-btn';
    mainBtn.innerHTML =
        '<svg id="mp-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg id="mp-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

    var nextBtn = document.createElement('button');
    nextBtn.className = 'music-sub-btn';
    nextBtn.innerHTML = '›';

    container.appendChild(prevBtn);
    container.appendChild(mainBtn);
    container.appendChild(nextBtn);
    document.body.appendChild(container);

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
        }).catch(function (e) {
            console.log("Autoplay blockiert. Warte auf Klick.");
        });
    }

    mainBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (playing) {
            music.pause();
            playing = false;
            localStorage.setItem('musicPlaying', '0');
            updateIcon();
        } else {
            tryPlay();
        }
    });

    function nextTrack() {
        currentTrackIndex++;
        if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
        if (playing) tryPlay();
    }

    function prevTrack() {
        currentTrackIndex--;
        if (currentTrackIndex < 0) currentTrackIndex = playlist.length - 1;
        loadTrack(currentTrackIndex);
        if (playing) tryPlay();
    }

    nextBtn.addEventListener('click', function(e) { e.stopPropagation(); nextTrack(); });
    prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prevTrack(); });

    music.addEventListener('ended', function() {
        nextTrack();
        tryPlay();
    });

    if (localStorage.getItem('musicPlaying') === '1') {
        document.addEventListener('click', function onFirst() {
            tryPlay();
            document.removeEventListener('click', onFirst);
        }, { once: true });
    }
})();
