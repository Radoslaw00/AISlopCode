/**
 * First-person camera controller for the shuttle cockpit
 */

class CameraController {
    constructor(scene) {
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100000
        );
        
        this.pitch = 0;
        this.yaw = 0;
        
        // Cockpit position offset from shuttle center
        this.cockpitOffset = { x: 0, y: 1, z: -8 };
        
        this.scene.add(this.camera);
    }
    
    update(shuttle, deltaTime) {
        // Get mouse input
        const mouseDelta = InputManager.getMouseDelta();
        
        // Update rotation
        this.yaw += mouseDelta.x;
        this.pitch -= mouseDelta.y;
        
        // Clamp pitch to prevent flipping
        this.pitch = clamp(this.pitch, -Math.PI / 2, Math.PI / 2);
        
        // Calculate camera position (cockpit position)
        const cockpitWorldPos = this.getCockpitWorldPosition(shuttle);
        this.camera.position.copy(cockpitWorldPos);
        
        // Calculate camera direction based on shuttle orientation and mouse look
        const direction = this.getViewDirection(shuttle);
        const target = {
            x: cockpitWorldPos.x + direction.x,
            y: cockpitWorldPos.y + direction.y,
            z: cockpitWorldPos.z + direction.z
        };
        
        this.camera.lookAt(target.x, target.y, target.z);
    }
    
    getCockpitWorldPosition(shuttle) {
        // Get cockpit position in shuttle's local coordinate system
        // For simplicity, offset is in shuttle-local coordinates
        
        // Start with shuttle position
        let worldPos = { ...shuttle.position };
        
        // In a full implementation, we'd transform the cockpit offset by shuttle orientation
        // For now, just add a simple offset
        worldPos.x += this.cockpitOffset.x;
        worldPos.y += this.cockpitOffset.y;
        worldPos.z += this.cockpitOffset.z;
        
        return worldPos;
    }
    
    getViewDirection(shuttle) {
        // Combine shuttle forward direction with mouse look
        const shuttleForward = { x: 0, y: 0, z: 1 }; // Shuttle's default forward direction
        
        // Apply pitch and yaw rotations
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        
        // Combined direction
        const x = sinYaw * cosPitch;
        const y = sinPitch;
        const z = cosYaw * cosPitch;
        
        return { x, y, z };
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
