import { scene, getCameraBounds } from './script.js';

// Array to store enemy bullets
export let enemyBullets = [];

let straightSpeed = 0.25;
let circleSpeed = 0.10;
let tripleSpeed = 0.15;

const firingDelay = 500;

// Function to create a straight bullet
function createStraightBullet(enemy) {
  const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  // Position the bullet at the enemy's position
  bullet.position.set(enemy.position.x, enemy.position.y, 0);

  // Move the bullet to the left
  bullet.direction = new THREE.Vector3(-1, 0, 0).normalize().multiplyScalar(straightSpeed);

  // Assign a type
  bullet.type = 'straight';

  // Add the bullet to the scene and to the enemy bullets array
  scene.add(bullet);
  enemyBullets.push(bullet);
}
  
// Function to create a circular bullet
function createCircleBullet(enemy) {
  const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });

  const numBullets = 8; // Number of bullets in the circle
  const spreadAngle = Math.PI * 2;
  
  for (let i = 0; i < numBullets; i++) {
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  
    // Position the bullet at the enemy's position
    bullet.position.set(enemy.position.x, enemy.position.y, 0);
  
    // Calculate the angle for this kind of bullet
    const angle = spreadAngle * (i / numBullets);
    const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
  
    // Store the direction for movement
    bullet.direction = direction.multiplyScalar(circleSpeed);
  
    // Assign a type
    bullet.type = 'circle';
  
    // Add the bullet to the scene and to the enemy bullets array
    scene.add(bullet);
    enemyBullets.push(bullet);
  }
}

// Function to create a triple bullet
function createTripleBullet(enemy) {
  const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x90D5FF });

  // Angles for the three bullets (straight, left, right)
  const bulletAngles = [Math.PI, 5*Math.PI / 6, 7 * Math.PI / 6];
  
  for (let i = 0; i < bulletAngles.length; i++) {
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  
    // Position the bullet at the enemy's position
    bullet.position.set(enemy.position.x, enemy.position.y, 0);
  
    // Calculate the direction for this kind of bullet
    const angle = bulletAngles[i];
    const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
  
    // Store the direction for movement
    bullet.direction = direction.multiplyScalar(tripleSpeed);
  
    // Assign a type
    bullet.type = 'triple';
  
    // Add the bullet to the scene and to the enemy bullets array
    scene.add(bullet);
    enemyBullets.push(bullet);
  }
}

// Function to create a random enemy bullet with cooldown
export function createEnemyBullet(enemy) {
  // Get the current time in milliseconds
  const currentTime = Date.now();
  
  // Check if the cooldown time has passed since the last fired bullet
  if (currentTime - enemy.lastFiredTime >= enemy.firingDelay) {
    // Update the last fired time to the current time
    enemy.lastFiredTime = currentTime;
  
    // Check the enemy's bullet type and create the corresponding bullet
    switch (enemy.bulletType) {
      case 'straight':
        createStraightBullet(enemy);
        break;
      case 'circle':
        createCircleBullet(enemy);
        break;
      case 'triple':
        createTripleBullet(enemy);
        break;
    }
  }
}

// Update all enemy bullets
export function updateEnemyBullets() {
  // Loop through all the bullets and update their position
  for (let i = 0; i < enemyBullets.length; i++) {
    const bullet = enemyBullets[i];

    // Update bullet position based on its direction
    bullet.position.add(bullet.direction);

    // Remove bullets if they go out of bounds
    if (bullet.position.x < -500 || bullet.position.x > 500 || bullet.position.y < -500 || bullet.position.y > 500) {
      scene.remove(bullet);
      enemyBullets.splice(i, 1);
      i--;
    }
  }
}