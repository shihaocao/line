import * as THREE from 'three';
import animationContext from './context.tsx';


export default class Body {
    enable_sphere: boolean;
    enable_trace: boolean;
    enable_anchor: boolean;
    enable_light: boolean;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    mass: number;
    color: number;
    maxPoints: number;
    currentPointIndex: number;
    totalPoints: number;
    mesh: THREE.Mesh;
    positionsArray: Float32Array;
    opacityArray: Float32Array;
    traceGeometry1: THREE.BufferGeometry;
    traceGeometry2: THREE.BufferGeometry;
    traceMaterial: THREE.ShaderMaterial;
    trace1: THREE.Line;
    trace2: THREE.Line;
    light: THREE.PointLight | null;
    context: typeof animationContext;

    constructor(
        position: THREE.Vector3,
        velocity: THREE.Vector3,
        color: number,
        mass: number,
        scene: THREE.Scene,
        enable_sphere: boolean,
        enable_trace: boolean,
        enable_anchor: boolean,
        enable_light: boolean,
        context: typeof animationContext = animationContext
    ) {
        this.enable_sphere = enable_sphere;
        this.enable_trace = enable_trace;
        this.enable_anchor = enable_anchor;
        this.enable_light = enable_light;
        this.position = new THREE.Vector3().copy(position);
        this.velocity = new THREE.Vector3().copy(velocity);
        this.acceleration = new THREE.Vector3();
        this.mass = mass;
        this.color = color;
        this.maxPoints = 10000;
        this.currentPointIndex = 0;
        this.totalPoints = 0;

        this.context = context;
        // Create a sphere to represent the body
        let size = 0.01;
        // size = 0.10;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        if (this.enable_sphere) {
            scene.add(this.mesh);
        }

        // Create a shared array for positions
        this.positionsArray = new Float32Array(this.maxPoints * 3);
        this.opacityArray = new Float32Array(this.maxPoints);

        // Create two geometries using the same positions array
        this.traceGeometry1 = new THREE.BufferGeometry();
        this.traceGeometry2 = new THREE.BufferGeometry();
        this.traceGeometry1.setAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));
        this.traceGeometry2.setAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));

        // Add an attribute for opacity to the geometries
        this.traceGeometry1.setAttribute('opacity', new THREE.BufferAttribute(this.opacityArray, 1));
        this.traceGeometry2.setAttribute('opacity', new THREE.BufferAttribute(this.opacityArray, 1));

        // Shader material to handle per-vertex opacity
        this.traceMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float opacity;
                varying float vOpacity;
                void main() {
                    vOpacity = opacity;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying float vOpacity;
                uniform vec3 color;
                void main() {
                    gl_FragColor = vec4(color, vOpacity);
                }
            `,
            uniforms: {
                color: { value: new THREE.Color(this.color) }
            },
            transparent: true
        });

        this.trace1 = new THREE.Line(this.traceGeometry1, this.traceMaterial);
        this.trace2 = new THREE.Line(this.traceGeometry2, this.traceMaterial);

        if (this.enable_trace) {
            scene.add(this.trace1);
            scene.add(this.trace2);
        }

        // Create a point light that follows the body
        if (this.enable_light) {
            this.light = new THREE.PointLight(this.color, 50, 10); // Intensity: 1, Distance: 10
            this.light.position.copy(this.position);
            scene.add(this.light);
        } else {
            this.light = null;
        }
    }

    update(dt: number): void {
        this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
        if (this.enable_anchor) {
            this.velocity = new THREE.Vector3(0, 0, 0);
        }
        this.position.add(this.velocity.clone().multiplyScalar(dt));

        this.mesh.position.copy(this.position);

        // Update light position if enabled
        if (this.light) {
            this.light.position.copy(this.position);
        }

        this.positionsArray[this.currentPointIndex * 3] = this.position.x;
        this.positionsArray[this.currentPointIndex * 3 + 1] = this.position.y;
        this.positionsArray[this.currentPointIndex * 3 + 2] = this.position.z;

        // Update opacity values based on age of the point
        for (let i = 0; i < this.maxPoints; i++) {
            const age = (this.maxPoints + this.currentPointIndex - i) % this.maxPoints;
            this.opacityArray[i] = 1 - age / this.maxPoints;
        }

        // Increment the index and wrap around if necessary (circular buffer)
        this.currentPointIndex = (this.currentPointIndex + 1) % this.maxPoints;
        this.totalPoints = Math.min(this.totalPoints + 1, this.maxPoints);

        // Update the draw ranges
        if (this.totalPoints < this.maxPoints) {
            this.traceGeometry1.setDrawRange(0, this.totalPoints);
            this.traceGeometry2.setDrawRange(0, 0);
        } else {
            const segment1Length = this.maxPoints - this.currentPointIndex;
            this.traceGeometry1.setDrawRange(this.currentPointIndex, segment1Length);

            const segment2Length = this.currentPointIndex;
            this.traceGeometry2.setDrawRange(0, segment2Length);
        }

        // make the size of the sphere depend on the mic volume
        // this could be undefined though!
        if (this.context) {
            // this.mesh.scale.setScalar(this.context.micVolume / 10);
            if(this.light) {
                this.light.intensity = Math.max(this.context.micVolume, 5);
            }
        }

        this.traceGeometry1.attributes.position.needsUpdate = true;
        this.traceGeometry1.attributes.opacity.needsUpdate = true;
        this.traceGeometry2.attributes.position.needsUpdate = true;
        this.traceGeometry2.attributes.opacity.needsUpdate = true;
    }

    // New method to calculate kinetic energy
    calculateKineticEnergy(): number {
        const speed = this.velocity.length();
        return 0.5 * this.mass * speed * speed;
    }
}
