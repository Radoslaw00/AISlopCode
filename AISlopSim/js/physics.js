/**
 * Physics engine for orbital mechanics and gravity
 */

const PhysicsEngine = {
    timeScale: 1.0, // Can be adjusted for faster/slower simulation
    
    update(shuttle, iss, earth, deltaTime) {
        // Clamp deltaTime to prevent physics explosion
        deltaTime = Math.min(deltaTime, 0.1);
        
        const scaledDeltaTime = deltaTime * this.timeScale;
        
        // Update shuttle
        this.updateShuttlePhysics(shuttle, earth, scaledDeltaTime);
        
        // Update ISS
        this.updateISSOrbit(iss, earth, scaledDeltaTime);
        
        // Check if shuttle crashed into Earth
        this.checkCollisions(shuttle, earth);
    },
    
    updateShuttlePhysics(shuttle, earth, deltaTime) {
        // Calculate gravitational acceleration
        const gravAccel = calculateGravitationalAcceleration(
            shuttle.position,
            earth.position
        );
        
        // Apply user input acceleration
        const inputAccel = shuttle.getInputAcceleration();
        
        // Total acceleration (convert from m/s² to km/s²)
        shuttle.acceleration = {
            x: (gravAccel.x + inputAccel.x) / 1000,
            y: (gravAccel.y + inputAccel.y) / 1000,
            z: (gravAccel.z + inputAccel.z) / 1000
        };
        
        // Update velocity
        shuttle.velocity.x += shuttle.acceleration.x * deltaTime;
        shuttle.velocity.y += shuttle.acceleration.y * deltaTime;
        shuttle.velocity.z += shuttle.acceleration.z * deltaTime;
        
        // Apply drag/air resistance (simplified)
        const speedSq = shuttle.velocity.x ** 2 + shuttle.velocity.y ** 2 + shuttle.velocity.z ** 2;
        const altitude = getAltitude(shuttle.position, earth.position);
        
        if (altitude < 100) { // Only apply drag below 100km
            const dragFactor = Math.exp(-altitude / 8); // Scale drag with altitude
            const dragCoefficient = 0.001 * dragFactor;
            
            shuttle.velocity.x *= (1 - dragCoefficient * deltaTime);
            shuttle.velocity.y *= (1 - dragCoefficient * deltaTime);
            shuttle.velocity.z *= (1 - dragCoefficient * deltaTime);
        }
        
        // Update position
        shuttle.position.x += shuttle.velocity.x * deltaTime;
        shuttle.position.y += shuttle.velocity.y * deltaTime;
        shuttle.position.z += shuttle.velocity.z * deltaTime;
        
        // Update mesh position
        shuttle.mesh.position.copy(shuttle.position);
    },
    
    updateISSOrbit(iss, earth, deltaTime) {
        // Calculate orbital velocity using Keplerian motion
        // For circular orbit: v = sqrt(GM / r)
        const radiusVector = {
            x: iss.position.x - earth.position.x,
            y: iss.position.y - earth.position.y,
            z: iss.position.z - earth.position.z
        };
        
        const radius = Math.sqrt(radiusVector.x ** 2 + radiusVector.y ** 2 + radiusVector.z ** 2);
        
        if (radius > 0) {
            // Gravitational acceleration towards Earth
            const accel = GM_KM / (radius * radius);
            
            // Current velocity magnitude (should be orbital velocity)
            const currentVelocity = getVelocityMagnitude(iss.velocity);
            const orbitalVelocity = Math.sqrt(GM_KM / radius);
            
            // Normalize radius vector
            const rNorm = {
                x: radiusVector.x / radius,
                y: radiusVector.y / radius,
                z: radiusVector.z / radius
            };
            
            // Maintain circular orbit by always moving perpendicular to radius
            // Calculate the direction of motion (perpendicular to radius)
            const motionDir = this.getPerpendicularDirection(radiusVector, iss.lastMotionNormal);
            iss.lastMotionNormal = motionDir;
            
            // Set velocity to orbital velocity in the perpendicular direction
            iss.velocity.x = motionDir.x * orbitalVelocity;
            iss.velocity.y = motionDir.y * orbitalVelocity;
            iss.velocity.z = motionDir.z * orbitalVelocity;
        }
        
        // Update position
        iss.position.x += iss.velocity.x * deltaTime;
        iss.position.y += iss.velocity.y * deltaTime;
        iss.position.z += iss.velocity.z * deltaTime;
        
        // Update mesh position
        iss.mesh.position.copy(iss.position);
    },
    
    getPerpendicularDirection(radiusVector, lastNormal) {
        // Create a perpendicular direction for orbital motion
        // Use simple cross product with a fixed axis, or continue from last direction
        
        if (!lastNormal || (lastNormal.x === 0 && lastNormal.y === 0 && lastNormal.z === 0)) {
            // Initialize with a perpendicular direction
            let perp = { x: -radiusVector.y, y: radiusVector.x, z: 0 };
            const mag = Math.sqrt(perp.x ** 2 + perp.y ** 2 + perp.z ** 2);
            if (mag > 0) {
                return { x: perp.x / mag, y: perp.y / mag, z: perp.z / mag };
            } else {
                return { x: 0, y: 0, z: 1 };
            }
        }
        
        // Continue in perpendicular direction (should remain perpendicular due to orbital mechanics)
        return lastNormal;
    },
    
    checkCollisions(shuttle, earth) {
        const distance = vectorDistance(shuttle.position, earth.position);
        
        if (distance < EARTH_RADIUS) {
            // Shuttle hit Earth - reset position
            console.warn('Collision with Earth - resetting position');
            shuttle.position = {
                x: EARTH_RADIUS + 408 + 50,
                y: EARTH_RADIUS + 408 + 50,
                z: 0
            };
            shuttle.velocity = { x: 0, y: 0, z: 0 };
            shuttle.mesh.position.copy(shuttle.position);
        }
    }
};
