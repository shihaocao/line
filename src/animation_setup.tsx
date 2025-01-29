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
    camera.position.z = 5
    // camera.position.y = 2; // up height

    // M2
    const renderer = new THREE.WebGLRenderer();
    //  I'm not sure if this does anything
    // const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    // const height = animationContext.render_buffer_height;
    animationContext.render_aspect_ratio = window.innerWidth/window.innerHeight;
    const height = animationContext.render_buffer_height_max;
    const width = animationContext.render_aspect_ratio * height;
    renderer.setDrawingBufferSize(width, height, window.devicePixelRatio);

    document.body.appendChild(renderer.domElement);

    // M1
    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize(854, 480); // Set drawing buffer size to 480p
    // renderer.domElement.style.width = '100%'; // Stretch canvas to full window width
    // renderer.domElement.style.height = '100%'; // Stretch canvas to full window height
    // document.body.appendChild(renderer.domElement);

    // OG
    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Composer for post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 5;
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

    let physicsTimestepCount = 0;
    let controlsLastUsedTime = performance.now();
    const rotationSpeed = 0.003;

    const start_time = performance.now();

    function update_animation_params() {
        const height = animationContext.render_buffer_height;
        const width = height * animationContext.render_aspect_ratio;
        renderer.setDrawingBufferSize(width, height, window.devicePixelRatio);
    }

    function animate() {
        requestAnimationFrame(animate);
        update_animation_params();

        const currentTime = performance.now();
        const elapsed = (currentTime - start_time) / 1000; // Convert to seconds
        animationContext.time_elapsed = elapsed;
        overlay_update_func();

        // Run multiple physics updates within each animation frame
        for (let i = 0; i < physicsUpdatesPerFrame; i++) {
            const physicsTimeStep = (animationContext.phsyics_multipler * timeStep) / physicsUpdatesPerFrame;

            system.update(physicsTimeStep);
            physicsTimestepCount++;
            animationContext.physics_timestep = physicsTimestepCount;
        }

        const timeSinceLastUse = currentTime - controlsLastUsedTime;
        if (timeSinceLastUse > 2000) {
            camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed * animationContext.camera_rot);
            camera.lookAt(scene.position);
        }

        snowEffect.update();

        composer.render(scene, camera);

        lastTime = currentTime;
    }

    // Start the animation
    animate();
}
