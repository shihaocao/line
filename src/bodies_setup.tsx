import * as THREE from 'three';
import Body from './body.tsx';
import seedrandom from 'seedrandom';
import {animationContext} from './context.tsx';


// Seeded random generator
const rng = seedrandom(3);
let debug = false; // Toggle for debugging pastel colors
// debug = true;
function getPastelColor(hue: number): number {
    const saturation = 0.7; // Fixed pastel-like saturation
    const lightness = 0.7; // Fixed pastel-like lightness
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    return color;
}

// Fixed hues for pastel red, orange, yellow, green, blue, and purple
const pastelHues = [
    0,             // Red
    120 / 360,     // Green
    240 / 360,     // Blue
    30 / 360,      // Orange
    60 / 360,      // Yellow
    270 / 360,     // Purple
];

// Generate the pastel color array
const pastelColors = pastelHues.map(getPastelColor);

export function setupBodiesAndSun(scene: THREE.Scene, context: typeof animationContext = animationContext): Body[] {
    const bodies: Body[] = [];

    function generateRandomBodiesWithAngularMomentum(
        N: number,
        totalAngularMomentum: number
    ): void {
        const angularMomentumPortions = Array.from({ length: N }, () => rng() * 0.1 + 0.9);
        const totalPortion = angularMomentumPortions.reduce((sum, portion) => sum + portion, 0);

        angularMomentumPortions.forEach((portion, index) => {
            angularMomentumPortions[index] = (portion / totalPortion) * totalAngularMomentum;
        });

        for (let i = 0; i < N; i++) {
            const position = new THREE.Vector3(
                (rng() - 0.5) * 5,
                (rng() - 0.5) * 1,
                (rng() - 0.5) * 5
            );

            const mass = 3 * (100 + rng() * 300);
            const angularMomentum = angularMomentumPortions[i];
            const radius = position.length();
            const speed = angularMomentum / (mass * radius);
            const velocity = new THREE.Vector3(-position.y, 0, position.z)
                .normalize()
                .multiplyScalar(speed);

            // Previously: Binary enable disable
            // let vis_body = false;
            // let vis_trace = false;
            // let vis_light = false;
            // if(i == 0 ) {
            //     vis_trace = true;
            //     vis_body = true;
            //     vis_light = true;
            // }
            // if (debug) {
            //     vis_body = true;
            //     vis_trace = true;
            //     vis_light = true;
            // }
            // Now we just let them all be visible and let opacity controls control visibility.
            let vis_body = true;
            let vis_trace = true;
            let vis_light = true;

            let body_context;
            let color = new THREE.Color(0xffffff);
            if (i == 0) {
                body_context = context.mainBodyContext;
                color = new THREE.Color(0xffffff);
            } else {
                color = pastelColors[i];
                body_context = context.debugBodyContext;
            }
            bodies.push(new Body(position, velocity, color, mass, scene, vis_body, vis_trace, false, vis_light, context, body_context));
        }
    }

    // Add the central "sun"
    const sunMass = 1e1;
    const sun = new Body(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0xffcc00,
        sunMass,
        scene,
        false,
        false,
        true, // enable anchor
        false,
        context,
        context.offBodyContext,
    );
    bodies.push(sun);

    // Generate orbiting bodies
    const N = 3;
    const totalAngularMomentum = 3 * 1000 * N;
    generateRandomBodiesWithAngularMomentum(N, totalAngularMomentum);

    return bodies;
}
