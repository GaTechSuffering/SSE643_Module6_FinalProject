import { setupPlayer, handlePlayerMovement, checkPlayerCollisions } from './player.js';
import { updateBullets } from './bullets.js';
import { enemies, createEnemy, updateEnemies, checkCollisions } from './enemy.js';
import { createEnemyBullet, updateEnemyBullets } from './enemyBullets.js';
import { createUI, updateTimerText, resetGameTimer, updateShieldReady, updateShield, isShieldOn } from './UI.js';

// Basic Scene Setup
export let scene = new THREE.Scene();
export let camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 10000);
let renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Position camera to view the "2D" scene
camera.position.set(0, 0, 100);

// Attach listener to camera (necessary to play sound)
export const listener = new THREE.AudioListener();
camera.add(listener);
export const audioLoader = new THREE.AudioLoader();

// Create background particles for the environment
const particleCount = 1000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

const bounds = getCameraBounds(); // Gets the camera boundaries

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3 + 0] = THREE.MathUtils.randFloat(bounds.minX, bounds.maxX); // X
  positions[i3 + 1] = THREE.MathUtils.randFloat(bounds.minY, bounds.maxY); // Y
  positions[i3 + 2] = THREE.MathUtils.randFloat(-10, 0); // Z depth range
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0xFFFFFF,
  size: 0.05,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const stars = new THREE.Points(geometry, material);
scene.add(stars);

function updateParticles() {
  const positions = stars.geometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Move stars toward the camera
    positions[i3 + 2] += 0.02;

    // Reset star if it gets too close
    if (positions[i3 + 2] > 0) {
      positions[i3 + 0] = THREE.MathUtils.randFloat(bounds.minX, bounds.maxX);
      positions[i3 + 1] = THREE.MathUtils.randFloat(bounds.minY, bounds.maxY);
      positions[i3 + 2] = -10;
    }
  }

  stars.geometry.attributes.position.needsUpdate = true;
}

// Add start screen and pause screen to control game flow/logic
export let paused = true;
const startScreen = document.getElementById('startScreen');

// On click start screen, begin game (animation)
startScreen.addEventListener('click', () => {
  // Hide the overlay
  startScreen.style.display = 'none';

  paused = false;
  resetGameTimer();

  // Start animation/game loop
  animate();
});

// Pause screen overlay
window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyP') {
    paused = !paused;
    console.log(paused ? 'Game Paused' : 'Game Resumed');

    const overlay = document.getElementById('pauseOverlay');
    if (overlay) overlay.style.display = paused ? 'flex' : 'none';
  }
});

// Initialises the game by setting up the player and creating the UI
setupPlayer();
createUI();

// Audio for on-hit player damage
const explosion = new THREE.Audio(listener);
audioLoader.load('./explosion.wav', function (buffer) {
  explosion.setBuffer(buffer);
  explosion.setVolume(0.50);
});

// Audio for enemy damage
const enemyExplosion = new THREE.Audio(listener);
audioLoader.load('./enemy_explosion.mp3', function (buffer) {
  enemyExplosion.setBuffer(buffer);
  enemyExplosion.setVolume(0.50);
});

function animate() {
  requestAnimationFrame(animate);

  if (paused) return; // If the game is paused, 
                      // jump out of animate function until game is unpaused

  // Update the player movement accordingly (WASD/Arrow keys)
  handlePlayerMovement();

  // Update bullets
  updateBullets();

  // Update enemy bullets
  updateEnemyBullets();

  // Update enemies
  updateEnemies();

  updateShieldReady();
  updateShield();

  if (!isShieldOn) {
  // Check for collisions between enemy bullets and player
  let hit = checkPlayerCollisions();
  if (hit) explosion.play();
  }

  // Check for collisions between player bullets and enemies
  let enemyHit = checkCollisions();
  if (enemyHit) enemyExplosion.play();

  // Update the particle environment (stars)
  updateParticles();

  renderer.render(scene, camera);
}

// Create enemies every 1500 ms if the game is not paused
setInterval(() => {
  if (!paused) createEnemy();
}, 1500);

// Update the on-screen timer every 1000 ms if the game is not paused
setInterval(() => {
  if (!paused) updateTimerText();
}, 1000);

// Enemies shoot bullets every interval (adjusted for individual firing delays)
setInterval(() => {
  // Ensure that there are enemies available before trying to create bullets
  if (enemies.length > 0) {
    enemies.forEach((enemy) => {
      createEnemyBullet(enemy);  // Create the bullet based on the enemy's type
    });
  }
}, 150);

// Convert screen coordinates to "world" coordinates for boundary check
function screenToWorld(x, y) {
  let worldX = (x / window.innerWidth) * 2 - 1;
  let worldY = -(y / window.innerHeight) * 2 + 1;
  return { x: worldX * camera.far / camera.position.z, y: worldY * camera.far / camera.position.z };
}

// Set up boundaries based on camera view
export function getCameraBounds() {
  // Get the camera's field of view and aspect ratio
  const cameraHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * Math.abs(camera.position.z);
  const cameraWidth = cameraHeight * camera.aspect;

  return {
    minX: -cameraWidth / 2,
    maxX: cameraWidth / 2,
    minY: -cameraHeight / 2,
    maxY: cameraHeight / 2,
  };
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);