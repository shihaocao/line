import * as THREE from 'three';
import Body from './body.tsx';

export class System {
    bodies: Body[];
    G: number;
    softeningFactor: number;
    gravitationalEnergies: number[][];
    energyLimit: number;

    constructor(bodies: Body[], scene: THREE.Scene, softeningFactor = 0.1, energyLimit = -5000) {
        this.bodies = bodies;
        this.G = 0.01;
        this.softeningFactor = softeningFactor;
        this.energyLimit = energyLimit;

        // Initialize gravitationalEnergies as a 2D array of zeros
        this.gravitationalEnergies = Array(this.bodies.length)
            .fill(null)
            .map(() => Array(this.bodies.length).fill(0));
    }

    update(dt: number): void {
        // Step 1: Calculate gravitational energies between each pair of bodies
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) { // Start j from i + 1
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];
                const direction = bodyB.position.clone().sub(bodyA.position);

                // Calculate softened distance
                const distanceSquared = direction.lengthSq() + this.softeningFactor;
                const distance = Math.sqrt(distanceSquared);

                // Gravitational potential energy calculation
                const potentialEnergy = -(this.G * bodyA.mass * bodyB.mass) / distance;
                this.gravitationalEnergies[i][j] = potentialEnergy;
                this.gravitationalEnergies[j][i] = potentialEnergy; // Mirror value to avoid duplication

                // We have to reset in this upper loop because we cant reset in the lower loop since we're accumulating
                bodyA.acceleration.set(0, 0, 0); // Reset acceleration for the new calculation
            }
        }

        // Step 2: Calculate accelerations based on gravitational forces, with energy limit check
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];

            const totalEnergyA = bodyA.calculateKineticEnergy() + this.getTotalGravitationalEnergy(i);

            for (let j = i + 1; j < this.bodies.length; j++) { // Start j from i + 1
                const bodyB = this.bodies[j];
                const totalEnergyB = bodyB.calculateKineticEnergy() + this.getTotalGravitationalEnergy(j);

                // console.log("Working on ", i, j, totalEnergyA, totalEnergyB);

                // Check if either body is anchored; if so, skip energy limit check for that body
                // Calculate the potential force
                const direction = bodyB.position.clone().sub(bodyA.position);
                const distanceSquared = direction.lengthSq() + this.softeningFactor;
                const forceMagnitude = (this.G * bodyA.mass * bodyB.mass) / distanceSquared;
                const force = direction.normalize().multiplyScalar(forceMagnitude);

                // Hypothetical new velocity and kinetic energy if force is applied
                const newVelocityA = bodyA.velocity.clone().add(force.clone().divideScalar(bodyA.mass).multiplyScalar(dt));
                const newVelocityB = bodyB.velocity.clone().add(force.clone().negate().divideScalar(bodyB.mass).multiplyScalar(dt));

                const newTotalEnergyA = 0.5 * bodyA.mass * newVelocityA.lengthSq() + this.getTotalGravitationalEnergy(i);
                const newTotalEnergyB = 0.5 * bodyB.mass * newVelocityB.lengthSq() + this.getTotalGravitationalEnergy(j);

                // If applying this force would exceed energy limit for either body, skip applying it
                if (!(bodyA.enable_anchor || bodyB.enable_anchor)) {
                    // For any body over the energy limit, if this acceleration would increase the total energy, don't do it.
                    if (((newTotalEnergyA > this.energyLimit) && (newTotalEnergyA > totalEnergyA)) || ((newTotalEnergyB > this.energyLimit) && (newTotalEnergyB > totalEnergyB))) {
                        continue;
                    }
                }

                // Apply acceleration if the energy limit is respected
                bodyA.acceleration.add(force.clone().divideScalar(bodyA.mass));
                bodyB.acceleration.add(force.negate().divideScalar(bodyB.mass));
            }
        }

        let system_energy = 0;
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            system_energy = system_energy + bodyA.calculateKineticEnergy() + this.getTotalGravitationalEnergy(i);
        }
        console.log("System energy: ", system_energy);
    }
    getTotalGravitationalEnergy(index: number): number {
        // Sum the gravitational energies for the specified body index
        return this.gravitationalEnergies[index].reduce((total, energy) => total + energy, 0);
    }
}
