/**
 * Space Shuttle class with first-person controls and physics
 */

class Shuttle {
    constructor(scene, startPosition = null) {
        this.scene = scene;
        
        // Physics properties
        this.position = startPosition || {
            x: EARTH_RADIUS + 408 + 50,
            y: EARTH_RADIUS + 408 + 50,
            z: 0
        };
        
        this.velocity = {
            x: -5.0, // Initial velocity towards orbit
            y: 0,
            z: 0
        };
        
        this.acceleration = { x: 0, y: 0, z: 0 };
        
        // Control properties
        this.thrustPower = 0.05; // km/s^2 per input
        this.mass = 0.1; // Simplified mass
        
        // Create mesh
        this.createMesh();
    }
    
    createMesh() {
        // Create shuttle body group
        this.mesh = new THREE.Group();
        
        // Main fuselage (cylindrical)
        const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
        const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.castShadow = true;
        fuselage.receiveShadow = true;
        this.mesh.add(fuselage);
        
        // Nose cone
        const noseGeometry = new THREE.ConeGeometry(0.3, 2, 8);
        const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.z = 5;
        nose.castShadow = true;
        nose.receiveShadow = true;
        this.mesh.add(nose);
        
        // Left wing
        const wingGeometry = new THREE.BoxGeometry(0.2, 5, 0.1);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.x = -2;
        leftWing.castShadow = true;
        leftWing.receiveShadow = true;
        this.mesh.add(leftWing);
        
        // Right wing
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.x = 2;
        rightWing.castShadow = true;
        rightWing.receiveShadow = true;
        this.mesh.add(rightWing);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(0.1, 0.1, 3);
        const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x0066ff });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.z = -4;
        tail.castShadow = true;
        tail.receiveShadow = true;
        this.mesh.add(tail);
        
        // Cargo bay doors
        const cargoDoorGeometry = new THREE.BoxGeometry(1.5, 0.05, 4);
        const cargoDoorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const cargoDoorTop = new THREE.Mesh(cargoDoorGeometry, cargoDoorMaterial);
        cargoDoorTop.position.y = 0.35;
        cargoDoorTop.castShadow = true;
        cargoDoorTop.receiveShadow = true;
        this.mesh.add(cargoDoorTop);
        
        const cargoDoorBottom = new THREE.Mesh(cargoDoorGeometry, cargoDoorMaterial);
        cargoDoorBottom.position.y = -0.35;
        cargoDoorBottom.castShadow = true;
        cargoDoorBottom.receiveShadow = true;
        this.mesh.add(cargoDoorBottom);
        
        // Engine nozzles
        const engineGeometry = new THREE.ConeGeometry(0.15, 0.5, 6);
        const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        
        for (let i = -1; i <= 1; i += 2) {
            const engine = new THREE.Mesh(engineGeometry, engineMaterial);
            engine.position.set(i * 0.5, -0.5, -4.5);
            engine.rotation.x = Math.PI / 2;
            engine.castShadow = true;
            engine.receiveShadow = true;
            this.mesh.add(engine);
        }
        
        // Set initial position and rotation
        this.mesh.position.copy(this.position);
        this.mesh.rotation.order = 'YXZ';
        
        this.scene.add(this.mesh);
    }
    
    getInputAcceleration() {
        const input = InputManager.getMovementInput();
        
        return {
            x: input.x * this.thrustPower,
            y: input.y * this.thrustPower,
            z: -input.z * this.thrustPower // Negative because forward is negative Z in Three.js camera convention
        };
    }
    
    update(deltaTime) {
        // Physics is handled by PhysicsEngine
        // This method can be used for shuttle-specific updates
    }
    
    getSpeed() {
        return getVelocityMagnitude(this.velocity);
    }
    
    getAltitude(earthPosition) {
        return getAltitude(this.position, earthPosition);
    }
    
    getDistanceTo(target) {
        return getDistanceTo(this.position, target);
    }
}
