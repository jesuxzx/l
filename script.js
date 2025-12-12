const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const albumCover = document.getElementById('album-cover');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const heartsContainer = document.getElementById('hearts-container');

let songItems = document.querySelectorAll('.playlist li');
let isPlaying = false;
let currentSongIndex = 0;
let progressInterval;

// --- Funcionalidad del Fondo de Corazones ---
function createHearts() {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.classList.add('heart');
    // Posición inicial aleatoria
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = Math.random() * 100 + 'vh';
    // Tamaño y duración de animación aleatorios
    const size = Math.random() * 20 + 10;
    heart.style.fontSize = size + 'px';
    heart.style.animationDuration = Math.random() * 4 + 3 + 's';
    heartsContainer.appendChild(heart);
    
    // Elimina el corazón después de su animación para no saturar el DOM
    setTimeout(() => {
        heart.remove();
    }, 7000);
}
// Crea un nuevo corazón cada 300 milisegundos
setInterval(createHearts, 300);

// --- Funcionalidad del Reproductor de Música ---

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0': ''}${secs}`;
}

function loadSong(index) {
    const song = songItems[index];
    const src = song.getAttribute('data-src');
    const cover = song.getAttribute('data-cover');
    const title = song.getAttribute('data-title');
    const artist = song.getAttribute('data-artist');
    const type = song.getAttribute('data-type');

    // Limpiar portada anterior
    albumCover.innerHTML = '';

    // Insertar imagen o video para la portada
    if (type === 'video') {
        const videoElement = document.createElement('video');
        videoElement.src = cover;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true; // Para evitar problemas de autoplay en navegadores
        videoElement.playsInline = true;
        videoElement.controls = false;
        albumCover.appendChild(videoElement);
    } else {
        const imgElement = document.createElement('img');
        imgElement.src = cover;
        imgElement.alt = "Portada del Álbum";
        albumCover.appendChild(imgElement);
    }

    // Agregar el overlay de vinilo (para el efecto visual)
    const vinylOverlay = document.createElement('div');
    vinylOverlay.classList.add('vinyl-overlay');
    albumCover.appendChild(vinylOverlay);

    // Actualizar información de la canción
    songTitle.textContent = title;
    songArtist.textContent = artist;

    // Actualizar clase activa en la playlist
    songItems.forEach(item => item.classList.remove('active'));
    song.classList.add('active');

    // Cargar la fuente de audio
    audioPlayer.src = src;
    audioPlayer.load();

    // Sincronizar estado de reproducción
    if (isPlaying) {
        audioPlayer.play();
        const currentMedia = albumCover.querySelector('video');
        if (currentMedia) currentMedia.play();
    } 

    progress.style.width = '0%';
    currentTimeEl.textContent = '0:00';

    // Obtener la duración de la nueva canción
    audioPlayer.onloadedmetadata = () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    };

    currentSongIndex = index;
}

function startProgressTimer() {
    clearInterval(progressInterval);
    progressInterval = setInterval(updateProgress, 1000);
}

function updateProgress() {
    if (audioPlayer && !isNaN(audioPlayer.duration)) {
        const duration = audioPlayer.duration;
        const currentTime = audioPlayer.currentTime;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    }
}

function togglePlay() {
    const currentMedia = albumCover.querySelector('img, video');

    if (isPlaying) {
        audioPlayer.pause();
        if (currentMedia && currentMedia.tagName === 'VIDEO') {
            currentMedia.pause();
        }
    } else {
        audioPlayer.play();
        if (currentMedia && currentMedia.tagName === 'VIDEO') {
            currentMedia.play();
        }
    }
    
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '⏯';
    albumCover.classList.toggle('playing', isPlaying);
}

function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songItems.length - 1;
    }
    loadSong(currentSongIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
}

function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > songItems.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(currentSongIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
}

function setProgress(e) {
    if (audioPlayer && !isNaN(audioPlayer.duration)) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const percent = clickX / width;
        audioPlayer.currentTime = audioPlayer.duration * percent;
    }
}

function setupPlaylistListeners() {
    songItems = document.querySelectorAll('.playlist li');
    songItems.forEach((item, index) => {
        item.onclick = () => {
            // Cargar y reproducir la canción seleccionada de la lista
            currentSongIndex = index;
            loadSong(currentSongIndex);
            audioPlayer.play();
            isPlaying = true;
            playBtn.textContent = '⏸';
            albumCover.classList.add('playing');
        };
    });
}

// --- Event Listeners del Reproductor ---

// Al terminar la canción, reproduce la siguiente
audioPlayer.addEventListener('ended', nextSong);

// Al empezar a reproducir
audioPlayer.addEventListener('play', () => {
    startProgressTimer();
    const currentMedia = albumCover.querySelector('video');
    if (currentMedia && currentMedia.tagName === 'VIDEO') {
        currentMedia.play();
    }
});

// Al pausar
audioPlayer.addEventListener('pause', () => {
    clearInterval(progressInterval);
    const currentMedia = albumCover.querySelector('video');
    if (currentMedia && currentMedia.tagName === 'VIDEO') {
        currentMedia.pause();
    }
});

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
progressBar.addEventListener('click', setProgress);

// --- Inicialización del DOM ---
document.addEventListener('DOMContentLoaded', () => {
    setupPlaylistListeners();
    if (songItems.length > 0) {
        // Carga la primera canción al inicio
        loadSong(currentSongIndex);
    } else {
        songTitle.textContent = "No hay canciones en la lista";
        songArtist.textContent = "";
    }
});