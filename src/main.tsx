import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Body from './body.tsx';
import System from './system.tsx';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// BEGIN SYSTEM
const bodies: Body[] = [
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


const system = new System(bodies, scene);

let lastTime = performance.now();
const targetFPS = 60;
const timeStep = 1 / targetFPS;
const timeStepMultiple = 10.0;

let controlsLastUsedTime = performance.now();
const rotationSpeed = 0.01;

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

    if (elapsed >= timeStep) {
        system.update(timeStep * timeStepMultiple);
        lastTime = currentTime - (elapsed % timeStep);
    }

    const timeSinceLastUse = currentTime - controlsLastUsedTime;
    if (timeSinceLastUse > 2000) {
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
        camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
}

animate();
