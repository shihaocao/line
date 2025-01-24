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

    // Create container for overlays and slider
    const container = document.createElement('div');
    container.className = `
        absolute top-12 left-2 bg-black/50 text-white rounded-lg p-2 space-y-2
        overflow-hidden hidden transition-[max-height] duration-500 ease-in-out
    `;
    document.body.appendChild(container);

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = `
        absolute top-2 left-2 bg-black/70 text-white rounded-lg p-2 text-sm flex items-center
        focus:outline-none transition-transform duration-300 ease-in-out
    `;
    hamburger.innerText = '☰'; // Hamburger icon
    document.body.appendChild(hamburger);

    // Add toggle functionality to the hamburger menu
    hamburger.addEventListener('click', () => {
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden', !isHidden);
        hamburger.classList.toggle('rotate-90', !isHidden); // Rotate icon when expanded
    });

    // Add overlays
    const overlay = document.createElement('div');
    overlay.className = `p-2 bg-black/50 rounded text-sm`;
    overlay.innerText = 'Physics Timesteps: 0';
    container.appendChild(overlay);

    const volumeOverlay = document.createElement('div');
    volumeOverlay.className = `p-2 bg-black/50 rounded text-sm`;
    volumeOverlay.innerText = 'Mic Volume: 0';
    container.appendChild(volumeOverlay);

    // Add slider
    const sliderContainer = document.createElement('div');
    sliderContainer.className = `
        p-2 bg-black/50 rounded text-sm flex items-center space-x-2
    `;
    sliderContainer.style.display = animationContext.sliderIsVis ? 'flex' : 'none';

    const sliderLabel = document.createElement('label');
    sliderLabel.className = `mr-2`;
    sliderLabel.innerText = 'Debug Opacity';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = `${animationContext.debugBodyContext.lineOpacity}`;
    slider.className = `w-full`;
    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        animationContext.debugBodyContext.lineOpacity = value;
        animationContext.debugBodyContext.bodyOpacity = value;
    });

    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    container.appendChild(sliderContainer);




    // Create scrolling overlay
    const scrollingOverlay = document.createElement('div');
    scrollingOverlay.className = `
        absolute bottom-5 left-[10%] right-[10%] h-[10%] overflow-y-auto p-2
        bg-black/70 text-white rounded-lg text-sm leading-relaxed
        shadow-md transition-all duration-300 ease-in-out
    `;

    // Add mouseover and mouseout event listeners
    scrollingOverlay.addEventListener('mouseover', () => {
        scrollingOverlay.classList.remove('h-[10%]');
        scrollingOverlay.classList.add('h-[25%]');
    });

    scrollingOverlay.addEventListener('mouseout', () => {
        scrollingOverlay.classList.remove('h-[25%]');
        scrollingOverlay.classList.add('h-[10%]');
    });

    // Append to the document body
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
