import { scene, getCameraBounds, gameStartTime } from './script.js';
import { HP_Pool } from './player.js';

// Create heart sprites
const hearts = [];

export let score = 0;

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

export function createUI() {
  const loader = new THREE.TextureLoader();

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

    return { updateScore, scoreSprite };
  });
}

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

// Resets the score on resetGame()
export function resetScore() {
  score = -10;
  updateScore();
}

// Resets the timer on resetGame()
export function resetGameTimer() {
  gameStartTime = Date.now();
  updateTimerText();
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