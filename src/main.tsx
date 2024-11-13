import * as THREE from 'three';
import seedrandom from 'seedrandom';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Body from './body.tsx';
import { System, RestrainerSystem } from './system.tsx';

// Set up the seeded random generator
const rng = seedrandom(123);

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

function getRandomPastelColor(): number {
    const hue = rng(); // Random hue between 0 and 1
    const saturation = 0.5 + rng() * 0.3; // Saturation around 50-80%
    const lightness = 0.8 + rng() * 0.2; // Lightness around 80-100%
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    return color.getHex();
}

const bodies: Body[] = [];

function generateRandomBodiesWithAngularMomentum(N: number, totalAngularMomentum: number, scene: THREE.Scene): Body[] {

    // Calculate the angular momentum portion for each body
    const angularMomentumPortions = Array.from({ length: N }, () => rng() * 0.1 + 0.9);
    const totalPortion = angularMomentumPortions.reduce((sum, portion) => sum + portion, 0);

    // Scale portions to match the specified total angular momentum
    angularMomentumPortions.forEach((portion, index) => {
        angularMomentumPortions[index] = (portion / totalPortion) * totalAngularMomentum;
    });

    for (let i = 0; i < N; i++) {
        // Random position within a radius of 10 units
        const position = new THREE.Vector3(
            (rng() - 0.5) * 5,
            (rng() - 0.5) * 5,
            (rng() - 0.5) * 1
        );

        // Mass between 1000 and 2000
        const mass = 1000 + rng() * 1000;

        // Calculate velocity for the required angular momentum L = r x (m * v)
        const angularMomentum = angularMomentumPortions[i];
        const radius = position.length();
        const speed = angularMomentum / (mass * radius);

        // Velocity direction perpendicular to the radius vector for circular motion
        const velocity = new THREE.Vector3(-position.y, position.x, 0).normalize().multiplyScalar(speed);

        // Pastel color
        const color = getRandomPastelColor();

        bodies.push(new Body(position, velocity, color, mass, scene, true, true, false));
    }
}

// Add the central fixed "sun" body
const sunMass = 1e3;
const sun = new Body(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0xffcc00, sunMass, scene, true, true, false);
bodies.push(sun);

// bodies.push(new Body(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.8, 0), 0xffcc00, sunMass, scene, true, true, false));
// Usage
const N = 2; // Number of orbiting bodies
const totalAngularMomentum = 1000 * N; // Desired total angular momentum
generateRandomBodiesWithAngularMomentum(N, totalAngularMomentum, scene);

// Axes helper
const axesHelper = new THREE.AxesHelper(10);
axesHelper.setColors(
    new THREE.Color(1.0, 0.6, 0.6),  // X-axis (red)
    new THREE.Color(0.6, 1.0, 0.6),  // Y-axis (green)
    new THREE.Color(0.6, 0.6, 1.0)   // Z-axis (blue)
);
scene.add(axesHelper);

const system = new System(bodies, scene);

function bodies_update(bodies: Body[], dt: number) {
    // Update each body based on its updated acceleration
    bodies.forEach(body => body.update(dt));

    // Reset accelerations after the update
    for (let i = 0; i < bodies.length; i++) {
        const bodyA = bodies[i];
        bodyA.acceleration.set(0, 0, 0);
    }
}

let lastTime = performance.now();
const targetFPS = 60;
const timeStep = 1 / targetFPS;
const physicsUpdatesPerFrame = 10; // Run physics updates 10 times per render frame
const physicsMultiplier = 1;
const physicsTimeStep = physicsMultiplier * timeStep / physicsUpdatesPerFrame;

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

    // Run multiple physics updates within each animation frame
    for (let i = 0; i < physicsUpdatesPerFrame; i++) {
        system.update(physicsTimeStep);
        bodies_update(bodies, physicsTimeStep);
    }

    lastTime = currentTime;

    const timeSinceLastUse = currentTime - controlsLastUsedTime;
    if (timeSinceLastUse > 2000) {
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
        camera.lookAt(scene.position);
    }

    // Render the scene at 60 FPS
    renderer.render(scene, camera);
}

animate();
