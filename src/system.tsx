import * as THREE from 'three';
import Body from './body.tsx';

export class System {
    bodies: Body[];
    G: number;
    softeningFactor: number;
    gravitationalEnergies: Map<number, Map<number, number>>; // Nested Map structure
    energyLimit: number;

    constructor(bodies: Body[], scene: THREE.Scene, softeningFactor = 0.1, energyLimit = -5000) {
        this.bodies = bodies;
        this.G = 0.01;
        this.softeningFactor = softeningFactor;
        this.energyLimit = energyLimit;

        // Initialize gravitationalEnergies as an empty Map of Maps
        this.gravitationalEnergies = new Map();
    }

    update(dt: number): void {
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

                // Reset acceleration for new calculation
                bodyA.acceleration.set(0, 0, 0);
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

        // Calculate and log the total system energy
        let system_energy = this.bodies.reduce((total, body) => total + body.calculateKineticEnergy(), 0);
        system_energy = system_energy;
        system_energy += this.calculateTotalGravitationalEnergy();
        console.log("System energy:", system_energy);
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
    
}
