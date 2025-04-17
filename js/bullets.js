import { scene, getCameraBounds } from './script.js';
import { sprite } from './player.js';

// Array to store bullets
export let bullets = [];

// Speed of the bullets
let bulletSpeed = 0.10;

// Creates a bullet
export function createBullet() {
  const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  
  // Position the bullet near the sprite
  bullet.position.set(sprite.position.x, sprite.position.y, 0);
  
  // Add bullet to the scene and the array
  scene.add(bullet);
  bullets.push(bullet);
}

// Updates bullet position and destroy when off-screen
export function updateBullets() {
  const bounds = getCameraBounds();  // Gets the camera boundaries
  
  // Loop through each bullet and update its position
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    // Move the bullet forward along the x-axis (right)
    bullet.position.x += bulletSpeed;
    
    // If the bullet goes off the screen, remove it
    if (bullet.position.x > bounds.maxX) {
      scene.remove(bullet);
      bullets.splice(i, 1);  // Remove the bullet from the array
    }
  }
}