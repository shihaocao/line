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
import { setup_overlays } from './overlays.tsx';


export function initializeAnimation(document: Document) {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6
    camera.position.y = 2; // up height

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

    const overlay_update_func = setup_overlays(document);

    // Animation state
    let lastTime = performance.now();
    const targetFPS = 60;
    const timeStep = 1 / targetFPS;
    const physicsUpdatesPerFrame = 1;
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
        if(elapsed > sliderFadeInTime && elapsed < sliderFadeInEndTime) {
            const val = maxAutoDebugOpacity * (elapsed - sliderFadeInTime) / (sliderFadeInEndTime - sliderFadeInTime);
            animationContext.debugBodyContext.bodyOpacity = val;
            animationContext.debugBodyContext.lineOpacity = val;
        }
    }    

    function animate() {
        requestAnimationFrame(animate);

        const currentTime = performance.now();
        const elapsed = (currentTime - start_time) / 1000; // Convert to seconds
        animationContext.time_elapsed = elapsed;
        updateSliderVisibility(elapsed);
        overlay_update_func();

        // Run multiple physics updates within each animation frame
        for (let i = 0; i < physicsUpdatesPerFrame; i++) {
            system.update(physicsTimeStep);
            physicsTimestepCount++;
            animationContext.physics_timestep = physicsTimestepCount;
        }

        // Update overlays
        // overlay.innerText = `Physics Timesteps: ${physicsTimestepCount}`;
        // volumeOverlay.innerText = `Audio Volume: ${animationContext.micVolume}`;
        animationContext.brightness = calculateBrightness(elapsed);
        // console.log('Brightness:', animationContext.brightness);

        // Update fade mask opacity (inverted brightness)

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
