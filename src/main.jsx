import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;  // Enable damping (inertia)

// Axes helper
const axesHelper = new THREE.AxesHelper(10);
axesHelper.setColors(
	new THREE.Color(1.0, 0.6, 0.6),  // X-axis (red)
	new THREE.Color(0.6, 1.0, 0.6),  // Y-axis (green)
	new THREE.Color(0.6, 0.6, 1.0)   // Z-axis (blue)
);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Brighter directional light
directionalLight.position.set(5, 5, 5).normalize(); // Position the light
scene.add(directionalLight);
// END SCENE INIT

// BEGIN SYSTEM
// -----
// import * as THREE from 'three';

class Body {
  constructor(position, velocity, color, mass, scene) {
    this.position = new THREE.Vector3().copy(position);
    this.velocity = new THREE.Vector3().copy(velocity);
    this.acceleration = new THREE.Vector3();
    this.mass = mass;
    this.color = color;
    this.points = [this.position.clone()]; // Initial point in trajectory

    // Create a sphere to represent the body
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh); // Add to scene once

  }

  update(dt) {
    this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
    this.position.add(this.velocity.clone().multiplyScalar(dt));
    this.mesh.position.copy(this.position); // Update Three.js mesh position

  }
}

class System {
  constructor(bodies, scene) {
    this.bodies = bodies;
    this.G = 0.0001
  }

  update(dt) {
    // Update accelerations based on 1/r^2 force between all bodies
    for (let i = 0; i < this.bodies.length; i++) {
      const bodyA = this.bodies[i];
      bodyA.acceleration.set(0, 0, 0);

      for (let j = 0; j < this.bodies.length; j++) {
        if (i !== j) {
          const bodyB = this.bodies[j];
          const direction = bodyB.position.clone().sub(bodyA.position);
          const distanceSquared = direction.lengthSq();
          const forceMagnitude = (this.G * bodyB.mass) / distanceSquared;
          const force = direction.normalize().multiplyScalar(forceMagnitude);
          bodyA.acceleration.add(force);
        }
      }
    }

    // Update each body based on its updated acceleration
    this.bodies.forEach(body => body.update(dt));
  }
}

// Example usage

const bodies = [
  new Body(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0xff0000, 10000, scene),
  new Body(new THREE.Vector3(2, 0, 0), new THREE.Vector3(0, 0.6, 0), 0x0000ff, 1000, scene),
  new Body(new THREE.Vector3(1, 1, 1), new THREE.Vector3(0, -0.7, 0), 0x00ffff, 1000, scene),

];

const system = new System(bodies, scene);

let lastTime = performance.now();
const targetFPS = 60;
const timeStep = 1 / targetFPS; // Fixed time step (in seconds)
const timeStepMultiple = 3.0;

function animate() {
  requestAnimationFrame(animate);

  // Get the current time and calculate the time difference
  const currentTime = performance.now();
  const elapsed = (currentTime - lastTime) / 1000; // Convert to seconds

  // Ensure the simulation runs at the desired time step (30 FPS)
  if (elapsed >= timeStep) {
    system.update(timeStep * timeStepMultiple);
    lastTime = currentTime - (elapsed % timeStep); // Compensate for any drift
  }

  renderer.render(scene, camera);
}

animate();
