/**
 * Utility functions for the space shuttle simulator
 */

// Constants
const EARTH_RADIUS = 6371; // km
const GRAVITATIONAL_CONSTANT = 6.674e-11; // m^3 kg^-1 s^-2
const EARTH_MASS = 5.972e24; // kg
const GM = GRAVITATIONAL_CONSTANT * EARTH_MASS; // Standard gravitational parameter (m^3/s^2)
const GM_KM = GM / (1e9); // Convert to km^3/s^2
const ISS_ORBITAL_RADIUS = EARTH_RADIUS + 408; // km (approximate altitude of ISS)
const ISS_ORBITAL_PERIOD = 5400; // seconds (~90 minutes)
const SCENE_SCALE = 1; // 1 unit = 1 km

// Convert 3D vector to distance
function vectorDistance(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Get altitude from position vector
function getAltitude(position, earthPosition) {
    const distance = vectorDistance(position, earthPosition);
    return Math.max(0, distance - EARTH_RADIUS);
}

// Calculate distance to object
function getDistanceTo(from, to) {
    return vectorDistance(from, to);
}

// Calculate velocity magnitude
function getVelocityMagnitude(velocity) {
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
}

// Normalize a vector
function normalizeVector(v) {
    const magnitude = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (magnitude === 0) return { x: 0, y: 0, z: 0 };
    return {
        x: v.x / magnitude,
        y: v.y / magnitude,
        z: v.z / magnitude
    };
}

// Calculate gravitational acceleration
function calculateGravitationalAcceleration(position, earthPosition) {
    const dx = earthPosition.x - position.x;
    const dy = earthPosition.y - position.y;
    const dz = earthPosition.z - position.z;
    
    const distanceSq = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSq);
    
    if (distance < EARTH_RADIUS) return { x: 0, y: 0, z: 0 };
    
    // a = GM / r^2, pointing towards Earth
    const acceleration = GM_KM / distanceSq;
    const accelX = (acceleration / distance) * dx;
    const accelY = (acceleration / distance) * dy;
    const accelZ = (acceleration / distance) * dz;
    
    return { x: accelX, y: accelY, z: accelZ };
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Random number in range
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Format number with commas and decimals
function formatNumber(num, decimals = 0) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
