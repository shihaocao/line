import * as THREE from 'three';

const range = 15;
const fall_speed = 0.005;
const floor_height = -15;
const particleCount = 3000;
const particle_dim = 0.02;
const rotation_multiplier = 0.01;

class SnowEffect {
    private snowflakes: THREE.InstancedMesh;
    private velocities: Float32Array;
    private rotationQuaternions: THREE.Quaternion[]; // Quaternions for each snowflake
    private rotationRates: THREE.Vector3[]; // Axis-angle rotation rates for each snowflake

    constructor(scene: THREE.Scene) {
        // Create custom snowflake geometry (a small plane or star shape)
        const snowflakeGeometry = new THREE.CircleGeometry(particle_dim, 6); // Hexagonal snowflake
        const snowflakeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });

        // Create InstancedMesh
        this.snowflakes = new THREE.InstancedMesh(snowflakeGeometry, snowflakeMaterial, particleCount);

        // Initialize each snowflake's position, quaternion, and fall speed
        const dummy = new THREE.Object3D();
        this.velocities = new Float32Array(particleCount);
        this.rotationQuaternions = new Array(particleCount).fill(null).map(() => new THREE.Quaternion());
        this.rotationRates = new Array(particleCount).fill(null).map(
            () =>
                new THREE.Vector3(
                    (Math.random() * rotation_multiplier - rotation_multiplier / 2),
                    (Math.random() * rotation_multiplier - rotation_multiplier / 2),
                    (Math.random() * rotation_multiplier - rotation_multiplier / 2)
                )
        );

        for (let i = 0; i < particleCount; i++) {
            // Randomize positions
            dummy.position.set(
                Math.random() * range - range / 2, // X
                Math.random() * range,             // Y
                Math.random() * range - range / 2  // Z
            );

            // Set initial quaternion (no rotation)
            this.rotationQuaternions[i].identity();

            // Apply transformations to each instance
            dummy.updateMatrix();
            this.snowflakes.setMatrixAt(i, dummy.matrix);

            // Randomize fall speed for each snowflake
            this.velocities[i] = Math.random() * fall_speed + fall_speed / 5;
        }

        // Add the snowflakes to the scene
        scene.add(this.snowflakes);
    }

    update() {
        const dummy = new THREE.Object3D();

        // Update each snowflake's position and rotation
        for (let i = 0; i < particleCount; i++) {
            // Retrieve the current transformation matrix
            this.snowflakes.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

            // Move snowflake down
            dummy.position.y -= this.velocities[i];

            // Apply rotation rates (quaternion rotation)
            const axis = this.rotationRates[i];
            const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis.normalize(), axis.length() * rotation_multiplier);
            this.rotationQuaternions[i].multiply(deltaQuat);

            // Apply updated quaternion to dummy
            dummy.quaternion.copy(this.rotationQuaternions[i]);

            // Reset snowflake position if it falls out of range
            if (dummy.position.y < floor_height) {
                dummy.position.set(
                    Math.random() * range - range / 2, // Reset X
                    range,                             // Reset Y to top
                    Math.random() * range - range / 2  // Reset Z
                );
                this.rotationQuaternions[i].identity(); // Reset rotation
            }

            // Update matrix for the instance
            dummy.updateMatrix();
            this.snowflakes.setMatrixAt(i, dummy.matrix);
        }

        // Mark the instanced mesh as needing an update
        this.snowflakes.instanceMatrix.needsUpdate = true;
    }
}

export default SnowEffect;
