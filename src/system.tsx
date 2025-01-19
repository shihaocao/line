import * as THREE from 'three';
import Body from './body.tsx';
import { animationContext } from './context.tsx';

function sigmoid(x, shift) {
    return 1 / (1 + Math.exp(-(x-shift)));
}


export class System {
    bodies: Body[];
    G: number;
    drag_coeff: number;
    softeningFactor: number;
    gravitationalEnergies: Map<number, Map<number, number>>; // Nested Map structure
    energyLimit: number;
    context: typeof animationContext; // Reference to the animation context

    constructor(
        bodies: Body[],
        scene: THREE.Scene,
        context: typeof animationContext = animationContext,
        softeningFactor = 0.1,
        energyLimit = -5000,
    ) {
        this.bodies = bodies;
        this.G = 0.01;
        this.drag_coeff = 0.0001;
        this.softeningFactor = softeningFactor;
        this.energyLimit = energyLimit;

        // Initialize gravitationalEnergies as an empty Map of Maps
        this.gravitationalEnergies = new Map();

        // Store a reference to the animationContext
        this.context = context;
    }

    bodies_update(bodies: Body[], dt: number) {
        // Update each body based on its updated acceleration
        bodies.forEach(body => body.update(dt));
    
        // Reset accelerations after the update
        for (let i = 0; i < bodies.length; i++) {
            const bodyA = bodies[i];
            bodyA.acceleration.set(0, 0, 0);
        }
    }

    update(dt: number): void {

        this.bodies_update(this.bodies, dt);

        // Step 1: Calculate gravitational energies between each pair of bodies
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) { // Only unique pairs
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];
                const direction = bodyB.position.clone().sub(bodyA.position);

                // Calculate softened distance
                const distanceSquared = direction.lengthSq();
                const distance = Math.sqrt(distanceSquared);

                // Gravitational potential energy calculation
                const potentialEnergy = -(this.G * bodyA.mass * bodyB.mass) / distance;

                // Store the gravitational energy in the Map of Maps
                if (!this.gravitationalEnergies.has(i)) {
                    this.gravitationalEnergies.set(i, new Map());
                }
                this.gravitationalEnergies.get(i)!.set(j, potentialEnergy);
            }
        }

        // Step 2: Calculate accelerations based on gravitational forces, with energy limit check
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];

                // Calculate the direction and distance between bodies
                const direction = bodyB.position.clone().sub(bodyA.position);
                const distanceSquared = direction.lengthSq() + this.softeningFactor;
                const forceMagnitude = (this.G * bodyA.mass * bodyB.mass) / distanceSquared;
                const force = direction.normalize().multiplyScalar(forceMagnitude);

                // Apply acceleration if the energy limit is respected
                bodyA.acceleration.add(force.clone().divideScalar(bodyA.mass));
                bodyB.acceleration.add(force.negate().divideScalar(bodyB.mass));
            }
        }

        // Add drag if the body is far
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            const direction = bodyA.velocity.clone().normalize();
            const dist_from_origin = bodyA.position.lengthSq();
            const speed = bodyA.velocity.lengthSq();
            let speed_penalty = 1;
            speed_penalty = 0.1 * speed;
            
            // if( speed > 10) {
            //     speed_penalty = 1;
            // } else {
            //     speed_penalty = (speed**2);
            // }
            // const dist_penalty = 1;
            const dist_penalty = 2 * dist_from_origin;
            // const speed_penalty = 1;
            const force_magnitude = speed_penalty * dist_penalty * this.drag_coeff;
            const force = direction.multiplyScalar(force_magnitude).negate();
            bodyA.acceleration.add(force);
        }

        // Accel when close
        // for (let i = 0; i < this.bodies.length; i++) {
        //     const bodyA = this.bodies[i];
        //     const vel = bodyA.velocity.clone();
        //     const speed = bodyA.velocity.lengthSq();
        //     const dist_from_origin = bodyA.position.lengthSq();

        //     if(dist_from_origin < 1) {
        //         const force_magnitude = 1
        //         const force = vel.normalize().multiplyScalar(force_magnitude);
        //         bodyA.acceleration.add(force);
        //     }
        // }

        // Repulse lightly from origin
        // for (let i = 0; i < this.bodies.length; i++) {
        //     const bodyA = this.bodies[i];
        //     const vel = bodyA.velocity.clone();
        //     const speed = bodyA.velocity.lengthSq();
        //     const dist_from_origin = bodyA.position.lengthSq();

        //     const force_magnitude = -1 * ((dist_from_origin - 1) * 0.4) ;
        //     const force = bodyA.position.clone().normalize().multiplyScalar(force_magnitude);
        //     bodyA.acceleration.add(force);
        // }

        // Accel when too far
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            const vel = bodyA.velocity.clone();
            const speed = bodyA.velocity.lengthSq();
            const dist_from_origin = bodyA.position.lengthSq();

            // const force_magnitude = -1 * 0.5*((dist_from_origin - 2) * (dist_from_origin-2) * (dist_from_origin+1));
            // const force_magnitude = -1 * Math.log(dist_from_origin+1); // pretty good
            const force_magnitude = -1 * sigmoid(dist_from_origin, 3); // i like this one too
            const force = bodyA.position.clone().normalize().multiplyScalar(force_magnitude);
            bodyA.acceleration.add(force);
        }

        // Calculate and log the total system energy
        let system_energy = this.bodies.reduce((total, body) => total + body.calculateKineticEnergy(), 0);
        system_energy = system_energy;
        system_energy += this.calculateTotalGravitationalEnergy();
        // console.log("System energy:", system_energy);
    }

    calculateTotalGravitationalEnergy(): number {
        let totalEnergy = 0;
        // Iterate over each pair in the Map of Maps, but only add (i, j) pairs where i < j to avoid double-counting
        for (let [i, innerMap] of this.gravitationalEnergies) {
            for (let [j, energy] of innerMap) {
                if (j > i) { // Only add pairs once where i < j
                    totalEnergy += energy;
                    // console.log("Adding grav: ", energy);
                }
            }
        }
        return totalEnergy;
    }

    mute() {
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            bodyA.mute();
        }
    }
    unmute() {
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            bodyA.unmute();
        }

    }
    
}
