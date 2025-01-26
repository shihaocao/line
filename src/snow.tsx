import * as THREE from 'three';
import { animationContext } from './context';

const range = 8;
const y_range = 11;
const fall_speed = 0.008;
const floor_height = -3.0;
const particleCount = 600;
const particle_dim = 0.02;
const rotation_multiplier = 0.1;
const stationary_duration = 400; // Number of updates to stay on the ground

class SnowEffect {
    private snowflakes: THREE.InstancedMesh;
    private velocities: Float32Array;
    private rotationQuaternions: THREE.Quaternion[];
    private rotationRates: THREE.Vector3[];
    private stationaryTimers: Int32Array;
    private opacities: Float32Array;
    private ground: THREE.Mesh;
    private light: THREE.PointLight;

    constructor(scene: THREE.Scene) {
        // Create custom snowflake geometry
        const snowflakeGeometry = new THREE.CircleGeometry(particle_dim, 6);
        const snowflakeMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            roughness: 1.0, // Adjust for a matte look
            metalness: 0.0, // Set to 0 for a non-metallic look
        });

        this.snowflakes = new THREE.InstancedMesh(snowflakeGeometry, snowflakeMaterial, particleCount);

        // Initialize snowflakes
        const dummy = new THREE.Object3D();
        this.velocities = new Float32Array(particleCount);
        this.rotationQuaternions = new Array(particleCount).fill(null).map(() => new THREE.Quaternion());
        this.rotationRates = new Array(particleCount).fill(null).map(
            () =>
                new THREE.Vector3(
                    Math.random() * rotation_multiplier - rotation_multiplier / 2,
                    Math.random() * rotation_multiplier - rotation_multiplier / 2,
                    Math.random() * rotation_multiplier - rotation_multiplier / 2
                )
        );
        this.stationaryTimers = new Int32Array(particleCount).fill(stationary_duration);
        this.opacities = new Float32Array(particleCount).fill(0.8);

        for (let i = 0; i < particleCount; i++) {
            dummy.position.set(
                Math.random() * range - range / 2,
                Math.random() * y_range + floor_height * 2,
                Math.random() * range - range / 2
            );

            this.rotationQuaternions[i].identity();
            dummy.updateMatrix();
            this.snowflakes.setMatrixAt(i, dummy.matrix);

            this.velocities[i] = Math.random() * fall_speed + fall_speed / 5;
        }

        scene.add(this.snowflakes);

        // Create and add the ground
        this.ground = this.createGround();
        scene.add(this.ground);

        // Create and add a light source
        // this.light = this.createLight();
        // scene.add(this.light);
    }

    private createGround(): THREE.Mesh {
        const groundGeometry = new THREE.PlaneGeometry(range * 4, range * 4);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333, // Dark gray base color
            roughness: 0.9,  // Matte surface
            metalness: 0,    // Non-metallic
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = floor_height;
        return ground;
    }

    private createLight(): THREE.PointLight {
        const light = new THREE.PointLight(0xffffff, 20, 50000); // Bright white light
        light.position.set(0, 2, 0); // Position the light above the ground
        light.castShadow = true;     // Enable shadows
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        return light;
    }

    update() {
        const dummy = new THREE.Object3D();
    
        for (let i = 0; i < particleCount; i++) {
            this.snowflakes.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    
            if (dummy.position.y <= floor_height) {
                if (this.stationaryTimers[i] === 0) {
                    dummy.position.y = y_range
                    this.stationaryTimers[i] = stationary_duration;
                    this.opacities[i] = 0.8;
                    this.velocities[i] = Math.random() * fall_speed + fall_speed / 5;
                } else if (this.stationaryTimers[i] > 0) {
                    this.stationaryTimers[i]--;
                    this.opacities[i] = Math.max(0, this.opacities[i] - 0.8 / stationary_duration);
                    this.velocities[i] = 0;
                }
            } else {
                dummy.position.y -= this.velocities[i] * animationContext.snow_speed;
    
                if (this.stationaryTimers[i] != 0) { // Only update rotation if not stationary
                    const axis = this.rotationRates[i];
                    const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis.normalize(), axis.length() * rotation_multiplier);
                    this.rotationQuaternions[i].multiply(deltaQuat);
                }
    
                dummy.quaternion.copy(this.rotationQuaternions[i]);
            }
    
            dummy.updateMatrix();
            this.snowflakes.setMatrixAt(i, dummy.matrix);
    
            const instanceColor = new THREE.Color(1, 1, 1).multiplyScalar(this.opacities[i]);
            this.snowflakes.setColorAt(i, instanceColor);
        }
    
        this.snowflakes.instanceMatrix.needsUpdate = true;
        this.snowflakes.instanceColor.needsUpdate = true;
    }
    
}

export default SnowEffect;
