import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { System } from './system.tsx';
import SnowEffect from './snow.tsx';
import { setupBodiesAndSun } from './bodies_setup.tsx';
import {animationContext} from './context.tsx';
import './styles.css';
import { getReadmeContent } from './blurb.tsx';


export function initializeAnimation(document: Document) {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

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
    bloomPass.threshold = 0;
    bloomPass.strength = 2;
    bloomPass.radius = 0.2;
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

    // Add slider
    const sliderContainer = document.createElement('div');
    sliderContainer.style.position = 'absolute';
    sliderContainer.style.top = '90px';
    sliderContainer.style.left = '10px';
    sliderContainer.style.color = 'white';
    sliderContainer.style.padding = '10px';
    sliderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    sliderContainer.style.borderRadius = '5px';
    sliderContainer.style.display = animationContext.sliderIsVis ? 'block' : 'none';
    sliderContainer.style.pointerEvents = animationContext.sliderIsVis ? 'auto' : 'none';
    
    const sliderLabel = document.createElement('label');
    sliderLabel.innerText = 'Debug Opacity ';
    sliderLabel.style.marginRight = '10px';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        animationContext.debugBodyContext.lineOpacity = value;
        animationContext.debugBodyContext.bodyOpacity = value;
        // console.log(`Brightness Slider Value: ${value}`);
    });

    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    document.body.appendChild(sliderContainer);

    // Create scrolling overlay
    const scrollingOverlay = document.createElement('div');
    scrollingOverlay.style.position = 'absolute';
    scrollingOverlay.style.bottom = '20px';
    scrollingOverlay.style.left = '10%'; // Set left and right padding instead of centering
    scrollingOverlay.style.right = '10%'; // This ensures 80% width dynamically
    scrollingOverlay.style.height = '15%';
    scrollingOverlay.style.overflowY = 'auto';
    scrollingOverlay.style.padding = '10px';
    scrollingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    scrollingOverlay.style.color = 'white';
    scrollingOverlay.style.borderRadius = '10px';
    scrollingOverlay.style.fontSize = '14px';
    scrollingOverlay.style.lineHeight = '1.5';
    scrollingOverlay.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    scrollingOverlay.className = 'scrolling-overlay'; // Add a class for custom styles
    document.body.appendChild(scrollingOverlay);


    scrollingOverlay.innerHTML = getReadmeContent();


    let isUserScrolling = false; // Track manual scrolling

    // Detect manual scrolling
    scrollingOverlay.addEventListener('wheel', () => {
        isUserScrolling = true; // Set flag when user scrolls manually
        clearTimeout(resetScrollTimeout); // Clear any pending resets
        resetScrollTimeout = setTimeout(() => {
            isUserScrolling = false; // Reset flag after inactivity
        }, 2000); // Wait for 2 seconds of inactivity
    });
    
    let resetScrollTimeout;
    
    // // Smooth automatic scrolling
    // function autoScrollOverlay() {
    //     if (!isUserScrolling) { // Only auto-scroll if the user isn't interacting
    //         scrollingOverlay.scrollBy({ top: 1, behavior: 'smooth' }); // Scroll by 1px smoothly
    //     }
    // }
    
    // // Call autoScrollOverlay periodically
    // setInterval(autoScrollOverlay, 1000); // Approximately 60 FPS

    // Add fade mask
    const fadeMask = document.createElement('div');
    fadeMask.style.position = 'absolute';
    fadeMask.style.top = '0';
    fadeMask.style.left = '0';
    fadeMask.style.width = '100%';
    fadeMask.style.height = '100%';
    fadeMask.style.backgroundColor = 'black';
    fadeMask.style.pointerEvents = 'none'; // Allow interaction with underlying elements
    fadeMask.style.transition = 'opacity 0.1s ease'; // Smooth transitions
    document.body.appendChild(fadeMask);

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

    // Brightness timing markers
    const fadeInEndTime = 2.0; // seconds
    const fadeOutStartTime = 160.0; // seconds
    const fadeOutEndTime = 180.0; // seconds

    const sliderFadeInTime = 15;
    const sliderFadeInEndTime = sliderFadeInTime + 10;
    const maxAutoDebugOpacity = 0.3;

    // Calculate brightness based on time
    function calculateBrightness(elapsed: number): number {
        if (elapsed <= fadeInEndTime) {
            return elapsed / fadeInEndTime; // Fade in: interpolate from 0 to 1
        } else if (elapsed >= fadeOutStartTime && elapsed <= fadeOutEndTime) {
            return 1 - (elapsed - fadeOutStartTime) / (fadeOutEndTime - fadeOutStartTime); // Fade out: 1 to 0
        } else if (elapsed > fadeOutEndTime) {
            return 0; // After fade out: brightness is 0
        } else {
            return 1; // Between fade in and fade out: brightness is 1
        }
    }
    const start_time = performance.now();

    function updateSliderVisibility(elapsed: number) {
        if(elapsed > sliderFadeInTime) {
            animationContext.sliderIsVis = true;
        }

        if(elapsed > sliderFadeInTime && elapsed < sliderFadeInEndTime) {
            const val = maxAutoDebugOpacity * (elapsed - sliderFadeInTime) / (sliderFadeInEndTime - sliderFadeInTime);
            animationContext.debugBodyContext.bodyOpacity = val;
            animationContext.debugBodyContext.lineOpacity = val;
        }

        if (animationContext.sliderIsVis) {
            sliderContainer.style.display = 'block';          // Show slider
            sliderContainer.style.pointerEvents = 'auto';     // Enable interaction
        } else {
            sliderContainer.style.display = 'none';           // Hide slider
            sliderContainer.style.pointerEvents = 'none';     // Disable interaction
        }
    }    

    function animate() {
        requestAnimationFrame(animate);

        const currentTime = performance.now();
        const elapsed = (currentTime - start_time) / 1000; // Convert to seconds

        updateSliderVisibility(elapsed);

        // Run multiple physics updates within each animation frame
        for (let i = 0; i < physicsUpdatesPerFrame; i++) {
            system.update(physicsTimeStep);
            physicsTimestepCount++;
        }

        // Update overlays
        overlay.innerText = `Physics Timesteps: ${physicsTimestepCount}`;
        volumeOverlay.innerText = `Audio Volume: ${animationContext.micVolume}`;
        animationContext.brightness = calculateBrightness(elapsed);
        // console.log('Brightness:', animationContext.brightness);

        // Update fade mask opacity (inverted brightness)
        fadeMask.style.opacity = `${1 - animationContext.brightness}`;

        const timeSinceLastUse = currentTime - controlsLastUsedTime;
        if (timeSinceLastUse > 2000) {
            camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
            camera.lookAt(scene.position);
        }

        snowEffect.update();

        composer.render(scene, camera);

        lastTime = currentTime;
    }

    // Start the animation
    animate();
}
