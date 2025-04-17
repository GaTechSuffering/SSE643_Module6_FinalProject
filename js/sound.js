import { paused, listener, audioLoader } from './script.js';
import { isShieldOn } from './UI.js';

let gameStartFirst = false;

// Audio for game start jingle 
const gameStart = new THREE.Audio(listener);
audioLoader.load('./game_start.mp3', function (buffer) {
  gameStart.setBuffer(buffer);
  gameStart.setVolume(1);

  window.addEventListener('click', () => {
    if (!gameStartFirst) {
      gameStart.play();
      gameStartFirst = true;
    }
  });
});

// Audio for background music
export const music = new THREE.Audio(listener);
audioLoader.load('./Spicy Calamari Inkantation.mp3', function (buffer) {
  music.setBuffer(buffer);
  music.setLoop(true);
  music.setVolume(1);

  // Wait for user gesture
  const playButton = document.createElement('button');
  playButton.innerText = 'Play Music';
  playButton.style.position = 'absolute';
  playButton.style.top = '10px';
  playButton.style.right = '20px';
  document.body.appendChild(playButton);

  window.addEventListener('click', () => {
    music.play();
  }); 
});

// Audio for player laser fire 
const laser = new THREE.Audio(listener);
audioLoader.load('./laser.mp3', function (buffer) {
  laser.setBuffer(buffer);
  laser.setVolume(0.25);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && paused == false) {
    if (listener.context.state === 'suspended') {
      // Resume audio if blocked by browser
      listener.context.resume();
    }

    if (laser.isPlaying) {
      // Stop and replay if already playing
      laser.stop();
    }

    laser.play();
  }
});