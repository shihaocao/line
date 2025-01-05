import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { System } from './system.tsx';
import SnowEffect from './snow.tsx';
import { setupBodiesAndSun } from './bodies_setup.tsx';
import animationContext from './context.tsx';

export function initializeAnimation(document: Document) {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Composer for post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.7;
    bloomPass.radius = 0;
    composer.addPass(bloomPass);

    // Setup bodies and system
    const bodies = setupBodiesAndSun(scene);
    const system = new System(bodies, scene, animationContext);

    // Snow effect
    const snowEffect = new SnowEffect(scene);

    // Add overlays
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

    // Animation state
    let lastTime = performance.now();
    const targetFPS = 60;
    const timeStep = 1 / targetFPS;
    const physicsUpdatesPerFrame = 10;
    const physicsMultiplier = 1.2;
    const physicsTimeStep = (physicsMultiplier * timeStep) / physicsUpdatesPerFrame;

    let physicsTimestepCount = 0;
    let controlsLastUsedTime = performance.now();
    const rotationSpeed = 0.005;

    function animate() {
        requestAnimationFrame(animate);

        const currentTime = performance.now();
        const elapsed = (currentTime - lastTime) / 1000;

        // Run multiple physics updates within each animation frame
        for (let i = 0; i < physicsUpdatesPerFrame; i++) {
            system.update(physicsTimeStep);
            physicsTimestepCount++;
        }

        overlay.innerText = `Physics Timesteps: ${physicsTimestepCount}`;
        animationContext.brightness = Math.sin(performance.now() / 1000) * 0.5 + 1;

        lastTime = currentTime;

        const timeSinceLastUse = currentTime - controlsLastUsedTime;
        if (timeSinceLastUse > 2000) {
            camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
            camera.lookAt(scene.position);
        }

        snowEffect.update();

        composer.render(scene, camera);
    }

    // Start the animation
    animate();
}
