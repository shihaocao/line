import * as THREE from 'three';
import Body from './body.tsx';

export class System {
    bodies: Body[];
    G: number;
    softeningFactor: number;

    constructor(bodies: Body[], scene: THREE.Scene, softeningFactor = 0.1) {
        this.bodies = bodies;
        this.G = 0.01;
        this.softeningFactor = softeningFactor; // Small value to prevent near-zero distances
    }

    update(dt: number): void {
        // Update accelerations based on 1/r^2 force between all bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];

            for (let j = 0; j < this.bodies.length; j++) {
                if (i !== j) {
                    const bodyB = this.bodies[j];
                    const direction = bodyB.position.clone().sub(bodyA.position);

                    // Apply softening factor to the squared distance
                    const distanceSquared = direction.lengthSq() + this.softeningFactor;

                    // Calculate force magnitude with softened distance
                    const forceMagnitude = (this.G * bodyB.mass) / distanceSquared;
                    const force = direction.normalize().multiplyScalar(forceMagnitude);
                    bodyA.acceleration.add(force);
                }
            }
        }
    }
}



export class RestrainerSystem {
    bodies: Body[];
    G: number;
    limit_param: number;

    constructor(bodies: Body[], limit_param: number) {
        this.bodies = bodies;
        this.G = 0.000001;
        this.limit_param = limit_param;
    }

    update(dt: number): void {
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            const distanceFromOrigin = bodyA.position.length();

            // Calculate the restoring (attractive) force
            const attractiveForceMagnitude = this.G * Math.exp(distanceFromOrigin - this.limit_param);
            const attractiveForceDirection = bodyA.position.clone().normalize().negate();
            const restoringForce = attractiveForceDirection.multiplyScalar(attractiveForceMagnitude);

            // Calculate the repulsive force for distances less than 1
            let repulsiveForce = new THREE.Vector3(0, 0, 0); // Default to zero force if distance >= 1
            if (distanceFromOrigin < 1) {
                const repulsiveForceMagnitude = -Math.log(distanceFromOrigin);
                const repulsiveForceDirection = bodyA.position.clone().normalize(); // Outward from origin
                repulsiveForce = repulsiveForceDirection.multiplyScalar(repulsiveForceMagnitude);
            }

            // Apply both forces to the acceleration
            bodyA.acceleration.add(restoringForce).add(repulsiveForce);
        }
    }
}
