import * as THREE from 'three';
import Body from './body.tsx';
import seedrandom from 'seedrandom';

// Seeded random generator
const rng = seedrandom(3);
let debug = false; // Toggle for debugging pastel colors
// debug = true;
function getRandomPastelColor(): number {
    const hue = rng();
    const saturation = 0.5 + rng() * 0.3;
    const lightness = 0.8 + rng() * 0.2;
    const color = new THREE.Color().setHSL(hue, saturation, lightness);
    return color.getHex();
}

export function setupBodiesAndSun(scene: THREE.Scene): Body[] {
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

            let vis_body = false;
            let vis_trace = false;
            let vis_light = false;
            if(i == 0 ) {
                vis_trace = true;
                vis_body = true;
                vis_light = true;
            }
            if (debug) {
                vis_body = true;
                vis_trace = true;
                vis_light = true;
            }
            const color = debug ? getRandomPastelColor() : new THREE.Color(0xffffff);

            bodies.push(new Body(position, velocity, color, mass, scene, vis_body, vis_trace, false, vis_light));
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
        debug,
        false,
        true,
        false
    );
    bodies.push(sun);

    // Generate orbiting bodies
    const N = 3;
    const totalAngularMomentum = 2 * 1000 * N;
    generateRandomBodiesWithAngularMomentum(N, totalAngularMomentum);

    return bodies;
}
