import { scene, getCameraBounds } from './script.js';
import { sprite, HP_Pool } from './player.js';

// Create heart sprites
const hearts = [];

export let score = 0;

const loader = new THREE.TextureLoader();

// Create canvas for score text
const scoreCanvas = document.createElement('canvas');
scoreCanvas.width = 256;
scoreCanvas.height = 64;
const ctx = scoreCanvas.getContext('2d');

// Draw initial score
ctx.font = '50px "PressStart2P"';
ctx.fillStyle = 'white';
ctx.fillText(`Score: ${score}`, 10, 40);

// Create texture from canvas
const scoreTexture = new THREE.CanvasTexture(scoreCanvas);
const scoreMaterial = new THREE.SpriteMaterial({ map: scoreTexture, transparent: true });

// Create canvas for timer text
const timerCanvas = document.createElement('canvas');
timerCanvas.width = 256;
timerCanvas.height = 64;
const timerCtx = timerCanvas.getContext('2d');

// Draw initial time
timerCtx.font = '50px "PressStart2P"';
timerCtx.fillStyle = 'white';
timerCtx.fillText(`Time: 00:00`, 10, 40);

// Create texture from canvas
const timerTexture = new THREE.CanvasTexture(timerCanvas);
const timerMaterial = new THREE.SpriteMaterial({ map: timerTexture, transparent: true });

// Cooldown bar for shield skill
const barWidth = 5, barHeight = 0.5;
const barGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
barGeometry.translate(barWidth / 2, 0, 0);
const barMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
const cooldownBar = new THREE.Mesh(barGeometry, barMaterial);
cooldownBar.position.set(1, 0, 0);

// Create the shield on sprite
const shieldOnTexture = loader.load('./shield_on.png');
const shieldOnMaterial = new THREE.SpriteMaterial({
  map: shieldOnTexture,
  transparent: true,
  opacity: 0.0, // Have to start fully transparent
  depthWrite: false
});

const shieldOn = new THREE.Sprite(shieldOnMaterial);
shieldOn.scale.set(5, 5, 1);

export function createUI() {
  // Load heart texture from image and place all UI items (hearts, score, timer)
  loader.load('heart.png', (heartTexture) => {
    const bounds = getCameraBounds();

    const margin = 0.2;
    const heartSpacing = 0;
    const heartSize = 1.5;

    const startX = bounds.minX + margin + heartSize / 2;
    const y = bounds.maxY - margin - heartSize / 2;

    // Place hearts on the top left of screen
    for (let i = 0; i < HP_Pool; i++) {
      const material = new THREE.SpriteMaterial({ map: heartTexture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(heartSize, heartSize, 1);
      sprite.position.set(startX + i * (heartSpacing + heartSize), y, 0);
      scene.add(sprite);
      hearts.push(sprite);
    }

    // Place score directly under hearts on the top left of screen
    const scoreSprite = new THREE.Sprite(scoreMaterial);
    scoreSprite.scale.set(4, 1, 1);
    scoreSprite.position.set(bounds.minX + margin*12, bounds.maxY - margin*12, 0);
    scene.add(scoreSprite);

    // Place timer directly under score on the top left of screen
    const timerSprite = new THREE.Sprite(timerMaterial);
    timerSprite.scale.set(4, 1, 1);
    timerSprite.position.set(bounds.minX + margin*12, bounds.maxY - margin*16, 0);
    scene.add(timerSprite);

    // Sprite for shield skill
    const textureLoader = new THREE.TextureLoader();
    const spriteMaterial = new THREE.SpriteMaterial({ map: textureLoader.load('./shield.png') });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(bounds.minX + margin*8, bounds.minY + margin * 8, 0);
    scene.add(sprite);

    sprite.add(cooldownBar);
    scene.add(shieldOn);

    return { updateScore, scoreSprite };
  });
}

export let gameStartTime = Date.now();

export function updateTimerText() {
  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Clear + redraw canvas
  timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  timerCtx.font = '50px "PressStart2P"';
  timerCtx.fillStyle = 'white';
  timerCtx.fillText(`Time: ${timeStr}`, 10, 40);

  timerTexture.needsUpdate = true;
}

// Reset the score on resetGame()
export function resetScore() {
  score = -10;
  updateScore();
}

// Reset the timer on resetGame()
export function resetGameTimer() {
  gameStartTime = Date.now();
  updateTimerText();
}

// Reset skill on resetGame()
export function resetSkill() {
  lastActivated = -cooldown; 
}

// Helper function to update score
export function updateScore() {
  score += 10;
  ctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  ctx.fillText(`Score: ${score}`, 10, 40);
  scoreTexture.needsUpdate = true;
}

// Helper function to reduce player HP
export function reduceHP() {
  if (hearts.length > 0) {
    const heart = hearts.pop();
    scene.remove(heart);
  }
}

export const clock = new THREE.Clock();
export let isShieldOn = false;

const shieldDuration = 5;

let shieldStartTime = 0;
let cooldown = 30;
let lastActivated = 0; 

export function updateShieldReady() {
  const elapsed = clock.getElapsedTime();
  const timeSinceLast = elapsed - lastActivated;

  // Animate cooldown bar
  const ratio = Math.min(timeSinceLast / cooldown, 1);
  cooldownBar.scale.x = ratio;

  // Change the bar's colour to white when ready
  cooldownBar.material.color.set(ratio >= 1 ? 0xFFFFFF : 0xFF0000);

  if (ratio == 1) return true;
  return false;
}

// Keep shield positioned over player sprite
function updateShieldPosition() {
  const worldPos = new THREE.Vector3();
  sprite.getWorldPosition(worldPos);
  shieldOn.position.copy(worldPos);
}

// Use skill when ready
export function useSkill() {
  const elapsed = clock.getElapsedTime();
    if (elapsed - lastActivated >= cooldown) {
      lastActivated = elapsed;
      activateShield();
    }
}

// Turn on shield once it is available and used
function activateShield() {
  shieldOn.visible = true;
  shieldStartTime = clock.getElapsedTime();
  isShieldOn = true;
}

const base = 0.35;
const amplitude = 0.15;
const speed = 1;

export function updateShield() {
  const time = clock.getElapsedTime();
  const elapsed = time - shieldStartTime;
  
  if (shieldOn.visible) {
    updateShieldPosition();
  }

  if (isShieldOn) {
    shieldOnMaterial.opacity = base + amplitude * Math.sin(elapsed * speed * Math.PI);
  }

  if (elapsed >= shieldDuration) {
    isShieldOn = false;
    shieldOn.visible = false;
  }
}