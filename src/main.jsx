import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Enable damping (inertia)

// Parameters
const speed = 0.1;
const maxPoints = 5000;
const gParam1 = 25, gParam2 = -12;
const power1 = 2, power2 = 3;
const A_MAX = 0.25;

// State variables
const state = {
    position: new THREE.Vector3(2.7, 0, 0),
    velocity: new THREE.Vector3(0.54, 2.7, 0.27),
    acceleration: new THREE.Vector3()
};

// Trace points array
const tracePoints = [];
const traceGeometry = new THREE.BufferGeometry();
traceGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
const traceMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const trace = new THREE.Line(traceGeometry, traceMaterial);
scene.add(trace);

// Axes helper
const axesHelper = new THREE.AxesHelper(10);
axesHelper.setColors(
    new THREE.Color(1.0, 0.6, 0.6),  // X-axis (red)
    new THREE.Color(0.6, 1.0, 0.6),  // Y-axis (green)
    new THREE.Color(0.6, 0.6, 1.0)   // Z-axis (blue)
);
scene.add(axesHelper);

function randomAcceleration() {
    return new THREE.Vector3(
        (Math.random() * 2 - 1) * A_MAX,
        (Math.random() * 2 - 1) * A_MAX,
        (Math.random() * 2 - 1) * A_MAX
    );
}

function gravitationalAcceleration(position, g_param, power) {
    const r = position.length();
    if (r === 0) return new THREE.Vector3(0, 0, 0);
    return position.clone().multiplyScalar(-g_param / (r ** (power + 1)));
}

function addTracePoint() {
    // Update acceleration
    state.acceleration.copy(randomAcceleration());
    state.acceleration.add(gravitationalAcceleration(state.position, gParam1, power1));
    state.acceleration.add(gravitationalAcceleration(state.position, gParam2, power2));

    // Euler integration
    state.velocity.add(state.acceleration.clone().multiplyScalar(speed));
    state.position.add(state.velocity.clone().multiplyScalar(speed));

    // Add position to trace points
    tracePoints.push(state.position.clone());
    if (tracePoints.length > maxPoints) tracePoints.shift();

    // Update trace geometry
    const positions = new Float32Array(tracePoints.length * 3);
    tracePoints.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
    });
    traceGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    traceGeometry.setDrawRange(0, tracePoints.length);
}

function animate() {
    addTracePoint();
	controls.update();  // Update orbit controls in the animation loop
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
