/**
 * ISS class for orbital station
 */

class ISS {
    constructor(scene, earthPosition) {
        this.scene = scene;
        this.earthPosition = earthPosition;
        
        // Initialize at orbital radius on the X axis
        const angle = Math.random() * Math.PI * 2;
        const radius = ISS_ORBITAL_RADIUS;
        
        this.position = {
            x: earthPosition.x + Math.cos(angle) * radius,
            y: earthPosition.y,
            z: earthPosition.z + Math.sin(angle) * radius
        };
        
        // Calculate orbital velocity
        const orbitalVelocity = Math.sqrt(GM_KM / radius);
        const perpDir = {
            x: -Math.sin(angle),
            y: 0,
            z: Math.cos(angle)
        };
        
        this.velocity = {
            x: perpDir.x * orbitalVelocity,
            y: 0,
            z: perpDir.z * orbitalVelocity
        };
        
        this.acceleration = { x: 0, y: 0, z: 0 };
        this.lastMotionNormal = perpDir;
        
        // Create mesh
        this.createMesh();
    }
    
    createMesh() {
        this.mesh = new THREE.Group();
        
        // Main truss (backbone)
        const trussGeometry = new THREE.BoxGeometry(0.3, 0.3, 12);
        const trussMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd });
        const truss = new THREE.Mesh(trussGeometry, trussMaterial);
        truss.castShadow = true;
        truss.receiveShadow = true;
        this.mesh.add(truss);
        
        // Solar array 1
        const solarGeometry = new THREE.BoxGeometry(0.05, 8, 2);
        const solarMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        
        const solar1 = new THREE.Mesh(solarGeometry, solarMaterial);
        solar1.position.set(-4, 0, 0);
        solar1.castShadow = true;
        solar1.receiveShadow = true;
        this.mesh.add(solar1);
        
        const solar2 = new THREE.Mesh(solarGeometry, solarMaterial);
        solar2.position.set(4, 0, 0);
        solar2.castShadow = true;
        solar2.receiveShadow = true;
        this.mesh.add(solar2);
        
        // Modules/segments
        const moduleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
        const moduleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        
        for (let i = -2; i <= 2; i++) {
            const module = new THREE.Mesh(moduleGeometry, moduleMaterial);
            module.position.z = i * 2.5;
            module.rotation.z = Math.PI / 2;
            module.castShadow = true;
            module.receiveShadow = true;
            this.mesh.add(module);
        }
        
        // Radiators
        const radiatorGeometry = new THREE.BoxGeometry(0.05, 1, 3);
        const radiatorMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        
        const radiator1 = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
        radiator1.position.set(-5, 0, 0);
        radiator1.castShadow = true;
        radiator1.receiveShadow = true;
        this.mesh.add(radiator1);
        
        const radiator2 = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
        radiator2.position.set(5, 0, 0);
        radiator2.castShadow = true;
        radiator2.receiveShadow = true;
        this.mesh.add(radiator2);
        
        // Set initial position
        this.mesh.position.copy(this.position);
        
        this.scene.add(this.mesh);
    }
    
    update(deltaTime) {
        // Physics is handled by PhysicsEngine
    }
    
    getSpeed() {
        return getVelocityMagnitude(this.velocity);
    }
    
    getAltitude(earthPosition) {
        return getAltitude(this.position, earthPosition);
    }
}
