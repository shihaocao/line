import * as THREE from 'three';
import Body from './body.tsx';

export default class System {
    bodies: Body[];
    G: number;

    constructor(bodies: Body[], scene: THREE.Scene) {
        this.bodies = bodies;
        this.G = 0.0001;
    }

    update(dt: number): void {
        // Update accelerations based on 1/r^2 force between all bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            bodyA.acceleration.set(0, 0, 0);

            for (let j = 0; j < this.bodies.length; j++) {
                if (i !== j) {
                    const bodyB = this.bodies[j];
                    const direction = bodyB.position.clone().sub(bodyA.position);
                    const distanceSquared = direction.lengthSq();
                    const forceMagnitude = (this.G * bodyB.mass) / distanceSquared;
                    const force = direction.normalize().multiplyScalar(forceMagnitude);
                    bodyA.acceleration.add(force);
                }
            }
        }

        // Update each body based on its updated acceleration
        this.bodies.forEach(body => body.update(dt));
    }
}

export class RestrainerSystem {
    bodies: Body[];
    G: number;

    constructor(bodies: Body[], scene: THREE.Scene) {
        this.bodies = bodies;
        this.G = 0.0001;
    }

    update(dt: number): void {
        // Update accelerations based on 1/r^2 force between all bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            bodyA.acceleration.set(0, 0, 0);

            for (let j = 0; j < this.bodies.length; j++) {
                if (i !== j) {
                    const bodyB = this.bodies[j];
                    const direction = bodyB.position.clone().sub(bodyA.position);
                    const distanceSquared = direction.lengthSq();
                    const forceMagnitude = (this.G * bodyB.mass) / distanceSquared;
                    const force = direction.normalize().multiplyScalar(forceMagnitude);
                    bodyA.acceleration.add(force);
                }
            }
        }

        // Update each body based on its updated acceleration
        this.bodies.forEach(body => body.update(dt));
    }
}
