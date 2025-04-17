import { scene, getCameraBounds, gameStartTime } from './script.js';
import { enemies } from './enemy.js';
import { bullets, createBullet } from './bullets.js';
import { enemyBullets } from './enemyBullets.js';
import { score, createUI, reduceHP, resetScore, resetGameTimer } from './UI.js';

export let sprite;
 
// Player's initial health
export let HP_Pool = 10;
let playerHealth = HP_Pool;

// Movement Variables
let moveSpeed = 0.15;
let keyboard = {
  up: false,
  down: false,
  left: false,
  right: false
};

// Sets up the player texture and event listeners (fire, movement)
export function setupPlayer() {
  // 2D Sprite Setup
  let spriteMaterial = new THREE.SpriteMaterial({
    transparent: true,
    depthTest: false
  });

  // Load texture with error handling
  new THREE.TextureLoader().load(
    'space.png',
    (texture) => {
      spriteMaterial.map = texture;
      spriteMaterial.needsUpdate = true;
      console.log('Texture loaded successfully.');
    },
    undefined, // onProgress
    (error) => console.error('Error loading texture:', error)
  );
  
  sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(2, 2, 1);
  sprite.rotation.x = Math.PI / 2; 
  sprite.position.set(-20, 0, 0);
  
  scene.add(sprite);

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        createBullet();
    }

    switch (e.key) {
      case 'w': case 'ArrowUp': keyboard.up = true; break;
      case 'a': case 'ArrowLeft': keyboard.left = true; break;
      case 's': case 'ArrowDown': keyboard.down = true; break;
      case 'd': case 'ArrowRight': keyboard.right = true; break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'w': case 'ArrowUp': keyboard.up = false; break;
      case 'a': case 'ArrowLeft': keyboard.left = false; break;
      case 's': case 'ArrowDown': keyboard.down = false; break;
      case 'd': case 'ArrowRight': keyboard.right = false; break;
    }
  });
}

// Update player movement based on setupPlayer() event listeners
export function handlePlayerMovement() {
  if (!sprite) return;

  if (keyboard.up) sprite.position.y += moveSpeed;
  if (keyboard.down) sprite.position.y -= moveSpeed;
  if (keyboard.left) sprite.position.x -= moveSpeed;
  if (keyboard.right) sprite.position.x += moveSpeed;

  const bounds = getCameraBounds();
  sprite.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, sprite.position.x));
  sprite.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, sprite.position.y));
}

// Function to check collisions between enemy bullets and the player
export function checkPlayerCollisions() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];

    // Check for collision (simple bounding box check for the player sprite)
    const distance = bullet.position.distanceTo(sprite.position);

    // If one of the enemy bullets hits the player (within 1 unit)
    if (distance < 1) {
      // Reduce player health
      playerHealth -= 1;
      reduceHP();
      blink(sprite);

      // Remove the bullet from the scene and array
      scene.remove(bullet);
      enemyBullets.splice(i, 1);

      // Check if the player is dead
      if (playerHealth <= 0) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Game over screen with prompt to allow the user to play again
        alert(`💀 Game over!\n🏆 Score: ${score}\n⏱️ Time Survived: ${timeStr}\n🔁 Click \'OK\' to play again.\n`);
        resetGame();
      }

      // Exit the loop once a collision is detected
      return true;
    }
  }
}

// Have the player blink on hit
function blink(object, times = 5, interval = 100) {
  let visible = true;
  let count = 0;

  const blinkInterval = setInterval(() => {
    visible = !visible;
    object.visible = visible;
    count++;

    if (count >= times * 2) {
      object.visible = true;
      clearInterval(blinkInterval);
    }
  }, interval);
}

// Resets the game by resetting player, UI and all arrays for enemies and bullets
function resetGame() {
  playerHealth = HP_Pool;
  sprite.position.set(-20, 0, 0);
  keyboard.up = false;
  keyboard.down = false;
  keyboard.left = false;
  keyboard.right = false;
  createUI();
  resetScore();
  resetGameTimer();
  resetArray(enemies);
  resetArray(bullets);
  resetArray(enemyBullets);
}

// Helper function to reset arrays
function resetArray(array) {
  array.forEach(obj => {
    // Remove object from scene
    scene.remove(obj);

    // Free GPU memory
    if (obj.geometry) obj.geometry.dispose();

    // Clean if there is a mesh (just in case)
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }

    // Clean if there is a sprite
    if (obj instanceof THREE.Sprite && obj.material.map) {
      obj.material.map.dispose();
    }
  });

  // Clear the array
  array.length = 0;
}