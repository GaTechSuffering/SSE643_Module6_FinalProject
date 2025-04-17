import { scene, getCameraBounds } from './script.js';
import { bullets } from './bullets.js';
import { updateScore } from './UI.js';

// Array to store enemies
export let enemies = [];

// Maximum number of enemies on the screen at any time
const maxEnemies = 10;

// Bullet types
const bulletTypes = ['straight', 'circle', 'triple'];

// Function to create an enemy with a specific bullet type
export function createEnemy() {
  // Only create an enemy if there are less than 10 on the screen
  if (enemies.length < maxEnemies) {
    let enemyMaterial = new THREE.SpriteMaterial({
      transparent: true,
      depthTest: false
    });
      
    // Load texture with error handling
    new THREE.TextureLoader().load(
      'enemy.png',
      (texture) => {
        enemyMaterial.map = texture;
        enemyMaterial.needsUpdate = true;
        console.log('Texture loaded successfully.');
      },
      undefined, // onProgress
      (error) => console.error('Error loading texture:', error)
    );  

    let enemy = new THREE.Sprite(enemyMaterial);
    enemy.scale.set(2,2,1);
    let xPos = getCameraBounds().maxX;
    let yPos = Math.random() * (getCameraBounds().maxY - getCameraBounds().minY) + getCameraBounds().minY;
  
    // Set random position
    enemy.position.set(xPos, yPos, 0);
  
    // Assign a random bullet type to this enemy
    const randomBulletType = bulletTypes[Math.floor(Math.random() * bulletTypes.length)];
    enemy.bulletType = randomBulletType;
  
    // Assign individual firing delay
    enemy.firingDelay = Math.random() * 1500 + 500;
    enemy.lastFiredTime = Date.now();
  
    // Add the enemy to the scene and to the enemies array
    scene.add(enemy);
    enemies.push(enemy);
  }
}

// Function to update enemy positions
export function updateEnemies() {
  const bounds = getCameraBounds(); // Gets the camera boundaries
  
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
      
    // Move the enemy towards the player (left)
    enemy.position.x -= 0.05;
  
    // If the enemy goes off the screen, remove it
    if (enemy.position.x < bounds.minX) {
      scene.remove(enemy);
      enemies.splice(i, 1);  // Remove enemy from the enemies array
    }
  }
}

// Collision detection between bullets and enemies
export function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      const bullet = bullets[i];
      const enemy = enemies[j];
  
      // Check for collision (simple bounding box check)
      const distance = bullet.position.distanceTo(enemy.position);
  
      // If the bullet hits the enemy (within 1 unit)
      if (distance < 1) {
        // Increase the score
        updateScore();
  
        // Remove the bullet and enemy from the scene and arrays
        scene.remove(bullet);
        scene.remove(enemy);
        bullets.splice(i, 1);
        enemies.splice(j, 1);
  
        // Exit the loop once a collision is detected
        return true;
      }
    }
  }
}