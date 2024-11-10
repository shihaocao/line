import * as THREE from 'three';

export default class Body {
    constructor(position, velocity, color, mass, scene, enable_sphere, enable_trace) {
        this.enable_sphere = enable_sphere
        this.enable_trace = enable_trace
        this.position = new THREE.Vector3().copy(position);
        this.velocity = new THREE.Vector3().copy(velocity);
        this.acceleration = new THREE.Vector3();
        this.mass = mass;
        this.color = color;
        this.maxPoints = 500; // Maximum number of points to keep in the trace
        this.currentPointIndex = 0; // Keeps track of the current index in the circular buffer
        this.totalPoints = 0; // Keeps track of how many points have been added

        // Create a sphere to represent the body
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        if( this.enable_sphere) {
   
            scene.add(this.mesh); // Add to scene once
        }

        // Create a shared array for positions
        this.positionsArray = new Float32Array(this.maxPoints * 3); // Preallocate the buffer
        this.opacityArray = new Float32Array(this.maxPoints); // Array for opacity values

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
            transparent: true // Allow transparency
        });

        this.trace1 = new THREE.Line(this.traceGeometry1, this.traceMaterial);
        this.trace2 = new THREE.Line(this.traceGeometry2, this.traceMaterial);

        if(this.enable_trace){
            scene.add(this.trace1);
            scene.add(this.trace2);
        }

    }

    update(dt) {
        // Update the position and velocity
        this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
        this.position.add(this.velocity.clone().multiplyScalar(dt));
        this.mesh.position.copy(this.position); // Update Three.js mesh position

        // Update the current point in the buffer geometry
        this.positionsArray[this.currentPointIndex * 3] = this.position.x;
        this.positionsArray[this.currentPointIndex * 3 + 1] = this.position.y;
        this.positionsArray[this.currentPointIndex * 3 + 2] = this.position.z;

        // Update opacity values based on age of the point
        for (let i = 0; i < this.maxPoints; i++) {
            const age = (this.maxPoints + this.currentPointIndex - i) % this.maxPoints;
            this.opacityArray[i] = 1 - age / this.maxPoints; // Opacity decreases with age
        }

        // Increment the index and wrap around if necessary (circular buffer)
        this.currentPointIndex = (this.currentPointIndex + 1) % this.maxPoints;

        // Update the total number of points (caps at maxPoints)
        this.totalPoints = Math.min(this.totalPoints + 1, this.maxPoints);

        // Update the draw ranges
        if (this.totalPoints < this.maxPoints) {
            // If we haven't filled the buffer yet, draw from 0 to totalPoints on trace1
            this.traceGeometry1.setDrawRange(0, this.totalPoints);
            this.traceGeometry2.setDrawRange(0, 0); // No second segment yet
        } else {
            // Draw from currentPointIndex to the end on trace1
            const segment1Length = this.maxPoints - this.currentPointIndex;
            this.traceGeometry1.setDrawRange(this.currentPointIndex, segment1Length);

            // Draw from start to currentPointIndex on trace2
            const segment2Length = this.currentPointIndex;
            this.traceGeometry2.setDrawRange(0, segment2Length);
        }

        // Mark the attributes as needing an update
        this.traceGeometry1.attributes.position.needsUpdate = true;
        this.traceGeometry1.attributes.opacity.needsUpdate = true;
        this.traceGeometry2.attributes.position.needsUpdate = true;
        this.traceGeometry2.attributes.opacity.needsUpdate = true;
    }
}
