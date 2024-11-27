import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { System } from './system.tsx';
import SnowEffect from './snow.tsx';
import { setupBodiesAndSun } from './bodies_setup.tsx'; // Import the setup function

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Bodies and system setup
const bodies = setupBodiesAndSun(scene);
const system = new System(bodies, scene);

// Snow effect
const snowEffect = new SnowEffect(scene);

// Physics and animation loop
let lastTime = performance.now();
const targetFPS = 60;
const timeStep = 1 / targetFPS;
const physicsUpdatesPerFrame = 10; // Run physics updates 10 times per render frame
const physicsMultiplier = 1;
const physicsTimeStep = (physicsMultiplier * timeStep) / physicsUpdatesPerFrame;

let controlsLastUsedTime = performance.now();
const rotationSpeed = 0.005;

// Event listeners for controls
controls.addEventListener('start', () => {
    controlsLastUsedTime = performance.now();
});
controls.addEventListener('change', () => {
    controlsLastUsedTime = performance.now();
});

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const elapsed = (currentTime - lastTime) / 1000;

    // Run multiple physics updates within each animation frame
    for (let i = 0; i < physicsUpdatesPerFrame; i++) {
        system.update(physicsTimeStep);
    }

    lastTime = currentTime;

    const timeSinceLastUse = currentTime - controlsLastUsedTime;
    if (timeSinceLastUse > 2000) {
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
        camera.lookAt(scene.position);
    }

    snowEffect.update();

    // Render the scene
    renderer.render(scene, camera);
}

animate();
