
document.addEventListener("DOMContentLoaded", () => {
  const playlist = [
    { title: "Romantic Tune", artist: "Music Band", duration: "3:08", src: "Assets/song 1.mp3" },
    { title: "Sad Turkish Tune", artist: "Tune", duration: "4:18", src: "Assets/song 2.mp3" },
    { title: "Sad Tune", artist: "instrumental", duration: "3:37", src: "Assets/song 3.mp3" },
    { title: "Motivational tune", artist: "ludovico einaudi", duration: "3:20", src: "Assets/Motivational tune.mp4" },
    { title: "Sad Violins", artist: "Hm music", duration: "4:29", src: "Assets/song 4.mp3" }
  ];

  const audio = document.getElementById("audio");
  const playPauseBtn = document.getElementById("play-pause");
  const playPauseIcon = playPauseBtn.querySelector("i");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const songTitle = document.getElementById("song-title");
  const songArtist = document.getElementById("song-artist");
  const currentTimeEl = document.getElementById("current-time");
  const songDurationEl = document.getElementById("song-duration");
  const progressBar = document.querySelector(".progress-bar");
  const progress = document.querySelector(".progress");
  const volumeSlider = document.querySelector(".volume-slider");
  const volumePercentage = document.querySelector(".volume-percentage");
  const songsList = document.getElementById("songs-list");
  const autoplayToggle = document.getElementById("autoplay");
  const repeatBtn = document.getElementById("repeat");
  const albumArt = document.querySelector(".album-art");
  const body = document.body;
  const statusMessage = document.getElementById("status-message");

  let currentIndex = null; // no song selected at start
  let isPlaying = false;
  let isRepeating = false;

  const backgrounds = [
    'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
    'linear-gradient(135deg, #4A00E0, #8E2DE2)',
    'linear-gradient(135deg, #3a7bd5, #00d2ff)',
    'linear-gradient(135deg, #834d9b, #d04ed6)',
    'linear-gradient(135deg, #5f2c82, #49a09d)'
  ];

  function loadSong(index) {
    const song = playlist[index];
    audio.src = song.src;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    body.style.background = backgrounds[index % backgrounds.length];
    progress.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    songDurationEl.textContent = "0:00";

    const items = document.querySelectorAll(".song-item");
    items.forEach((el, i) => el.classList.toggle("active", i === index));

    audio.addEventListener("loadedmetadata", () => {
      songDurationEl.textContent = formatTime(audio.duration);
      statusMessage.style.display = "none";
    }, { once: true });

    audio.addEventListener("error", (e) => {
      console.log("Audio loading error:", e);
      statusMessage.textContent = `Error loading song: ${song.title}`;
      statusMessage.style.display = "block";
    }, { once: true });

    currentIndex = index;
  }

  function renderPlaylist() {
    songsList.innerHTML = "";
    playlist.forEach((song, index) => {
      const div = document.createElement("div");
      div.classList.add("song-item");
      div.innerHTML = `
        <div class="song-details">
          <div class="song-title">${song.title}</div>
          <div class="song-artist">${song.artist}</div>
        </div>
        <div class="song-duration">${song.duration}</div>
      `;
      div.addEventListener("click", () => {
        loadSong(index);
        playSong();
      });
      songsList.appendChild(div);
    });
  }

  function playSong() {
    if (currentIndex === null) return; // no song selected yet
    isPlaying = true;
    audio.play().then(() => {
      playPauseIcon.classList.replace("fa-play", "fa-pause");
      albumArt.classList.add("playing");
      statusMessage.style.display = "none";
    }).catch(err => {
      console.log("Playback error:", err);
      statusMessage.textContent = `Error playing song: ${err.message}`;
      statusMessage.style.display = "block";
      isPlaying = false;
    });
  }

  function pauseSong() {
    isPlaying = false;
    audio.pause();
    playPauseIcon.classList.replace("fa-pause", "fa-play");
    albumArt.classList.remove("playing");
  }

  function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const min = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${min}:${s < 10 ? "0" + s : s}`;
  }

  function updateProgress() {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = `${percent}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  }

  function setProgress(e) {
    if (!audio.duration) return;
    const clickX = e.offsetX;
    const width = this.clientWidth;
    audio.currentTime = (clickX / width) * audio.duration;
  }

  function setVolume(e) {
    const clickX = e.offsetX;
    const width = this.clientWidth;
    audio.volume = clickX / width;
    volumePercentage.style.width = `${audio.volume * 100}%`;
  }

  function prevSong() {
    if (currentIndex === null) return;
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentIndex);
    playSong();
  }

  function nextSong() {
    if (currentIndex === null) return;
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex);
    playSong();
  }

  function toggleRepeat() {
    isRepeating = !isRepeating;
    repeatBtn.classList.toggle("active", isRepeating);
  }

  // --- Event Listeners ---
  playPauseBtn.addEventListener("click", () => {
    if (currentIndex === null) {
      loadSong(0); // default first song if nothing chosen
    }
    isPlaying ? pauseSong() : playSong();
  });
  prevBtn.addEventListener("click", prevSong);
  nextBtn.addEventListener("click", nextSong);
  repeatBtn.addEventListener("click", toggleRepeat);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", () => {
    if (isRepeating) {
      audio.currentTime = 0;
      playSong();
    } else if (autoplayToggle.checked) {
      nextSong();
    } else {
      pauseSong();
    }
  });
  progressBar.addEventListener("click", setProgress);
  volumeSlider.addEventListener("click", setVolume);

  // Init
  audio.volume = 0.7;
  volumePercentage.style.width = "70%";
  renderPlaylist();
});
