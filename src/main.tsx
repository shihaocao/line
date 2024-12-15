import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { System } from './system.tsx';
import SnowEffect from './snow.tsx';
import { setupBodiesAndSun } from './bodies_setup.tsx';
import animationContext from './context.tsx'; // Import the animation context
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

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
const system = new System(bodies, scene, animationContext); // Pass context to the system

// Snow effect
const snowEffect = new SnowEffect(scene);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1; // Bloom threshold
bloomPass.strength = 1.0; // Bloom strength
bloomPass.radius = 0;     // Bloom radius
composer.addPass(bloomPass);

// Add an overlay textbox for physics timesteps
const overlay = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.top = '10px';
overlay.style.left = '10px';
overlay.style.color = 'white';
overlay.style.padding = '10px';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
overlay.style.borderRadius = '5px';
overlay.innerText = 'Physics Timesteps: 0';
document.body.appendChild(overlay);

// Add an overlay for microphone volume level
const volumeOverlay = document.createElement('div');
volumeOverlay.style.position = 'absolute';
volumeOverlay.style.top = '40px';
volumeOverlay.style.left = '10px';
volumeOverlay.style.color = 'white';
volumeOverlay.style.padding = '10px';
volumeOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
volumeOverlay.style.borderRadius = '5px';
volumeOverlay.innerText = 'Mic Volume: 0';
document.body.appendChild(volumeOverlay);

// Physics and animation loop
let lastTime = performance.now();
const targetFPS = 60;
const timeStep = 1 / targetFPS;
const physicsUpdatesPerFrame = 10; // Run physics updates 10 times per render frame
const physicsMultiplier = 1;
const physicsTimeStep = (physicsMultiplier * timeStep) / physicsUpdatesPerFrame;

let controlsLastUsedTime = performance.now();
const rotationSpeed = 0.005;

// Physics timestep counter
let physicsTimestepCount = 0;

// Request access to the user's microphone
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
        // Create an audio context and connect the microphone stream
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        // Data array to store the frequency data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Function to calculate the average volume
        function getAverageVolume(array: Uint8Array): number {
            const sum = array.reduce((a, b) => a + b, 0);
            return sum / array.length;
        }

        // Animation loop to update mic volume level
        function updateVolume() {
            composer.render();

            requestAnimationFrame(updateVolume);

            // Get frequency data from the analyser
            analyser.getByteFrequencyData(dataArray);

            // Calculate and scale the average volume to 0-100
            const averageVolume = getAverageVolume(dataArray);
            animationContext.micVolume = Math.round((averageVolume / 255) * 100);

            // Update the overlay
            volumeOverlay.innerText = `Mic Volume: ${animationContext.micVolume}`;
        }

        updateVolume();
    })
    .catch((error) => {
        console.error('Error accessing microphone:', error);

        // Show an error message if mic access fails
        const errorOverlay = document.createElement('div');
        errorOverlay.style.position = 'absolute';
        errorOverlay.style.top = '10px';
        errorOverlay.style.left = '10px';
        errorOverlay.style.color = 'red';
        errorOverlay.style.padding = '10px';
        errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        errorOverlay.style.borderRadius = '5px';
        errorOverlay.innerText = 'Error: Unable to access microphone';
        document.body.appendChild(errorOverlay);
    });

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const elapsed = (currentTime - lastTime) / 1000;

    // Run multiple physics updates within each animation frame
    for (let i = 0; i < physicsUpdatesPerFrame; i++) {
        system.update(physicsTimeStep); // Use animationContext in system's update logic
        physicsTimestepCount++;
    }

    // Update the overlay text with the current physics timestep count
    overlay.innerText = `Physics Timesteps: ${physicsTimestepCount}`;

    // Dynamically adjust brightness based on time
    animationContext.brightness = Math.sin(performance.now() / 1000) * 0.5 + 1;

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
