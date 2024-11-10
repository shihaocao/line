import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import Body from './body.jsx'

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;  // Enable damping (inertia)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Brighter directional light
directionalLight.position.set(5, 5, 5).normalize(); // Position the light
scene.add(directionalLight);

// BEGIN SYSTEM

class System {
    constructor(bodies, scene) {
        this.bodies = bodies;
        this.G = 0.0001;
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

const bodies = [
    new Body(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0xff0000, 5000, scene, true, true),
    new Body(new THREE.Vector3(2, 0, 0), new THREE.Vector3(0, 0.4, 0), 0x0000ff, 1000, scene, true, true),
    new Body(new THREE.Vector3(1, 1, 1), new THREE.Vector3(0, -0.3, 0), 0xffffff, 1000, scene, true, true),
];
// Axes helper
const axesHelper = new THREE.AxesHelper(10);
axesHelper.setColors(
    new THREE.Color(1.0, 0.6, 0.6),  // X-axis (red)
    new THREE.Color(0.6, 1.0, 0.6),  // Y-axis (green)
    new THREE.Color(0.6, 0.6, 1.0)   // Z-axis (blue)
);
scene.add(axesHelper);

// edgy
// const bodies = [
//   new Body(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0xff0000, 5000, scene, false, false),
//   new Body(new THREE.Vector3(2, 0, 0), new THREE.Vector3(0, 0.4, 0), 0x0000ff, 1000, scene, false, false),
//   new Body(new THREE.Vector3(1, 1, 1), new THREE.Vector3(0, -0.3, 0), 0xffffff, 1000, scene, false, true),
// ];


const system = new System(bodies, scene);

let lastTime = performance.now();
const targetFPS = 60;
const timeStep = 1 / targetFPS; // Fixed time step (in seconds)
const timeStepMultiple = 10.0;

let controlsLastUsedTime = performance.now();
const rotationSpeed = 0.01; // Rotation speed when inactive

// Event listeners to track when the controls are used
controls.addEventListener('start', () => {
    controlsLastUsedTime = performance.now();
});
controls.addEventListener('change', () => {
    controlsLastUsedTime = performance.now();
});

function animate() {
    requestAnimationFrame(animate);

    // Get the current time and calculate the time difference
    const currentTime = performance.now();
    const elapsed = (currentTime - lastTime) / 1000; // Convert to seconds

    // Ensure the simulation runs at the desired time step (60 FPS)
    if (elapsed >= timeStep) {
        system.update(timeStep * timeStepMultiple);
        lastTime = currentTime - (elapsed % timeStep); // Compensate for any drift
    }

    // Rotate camera around Z-axis if controls have not been used recently
    const timeSinceLastUse = currentTime - controlsLastUsedTime;
    if (timeSinceLastUse > 2000) { // 2-second threshold for inactivity
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
        camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
}

animate();
