/**
 * Main scene setup and animation loop
 */

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.0001);

// Camera
const cameraController = new CameraController(scene);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(500, 500, 500);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.far = 3000;
sunLight.shadow.camera.left = -1000;
sunLight.shadow.camera.right = 1000;
sunLight.shadow.camera.top = 1000;
sunLight.shadow.camera.bottom = -1000;
scene.add(sunLight);

// Stars background
const starsGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const posArray = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
    const distance = randomRange(500, 10000);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    posArray[i] = distance * Math.sin(phi) * Math.cos(theta);
    posArray[i + 1] = distance * Math.sin(phi) * Math.sin(theta);
    posArray[i + 2] = distance * Math.cos(phi);
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 5,
    sizeAttenuation: true,
    color: 0xffffff
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Earth
const earth = {
    position: { x: 0, y: 0, z: 0 },
    radius: EARTH_RADIUS
};

// Create Earth mesh
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
const earthCanvas = createEarthTexture();
const earthTexture = new THREE.CanvasTexture(earthCanvas);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 5
});
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
scene.add(earthMesh);

// Create Earth texture procedurally
function createEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Ocean
    ctx.fillStyle = '#1a5490';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Land masses
    ctx.fillStyle = '#2d8659';
    ctx.fillRect(200, 250, 400, 250);
    ctx.fillRect(800, 300, 300, 200);
    ctx.fillRect(1400, 400, 200, 150);
    ctx.fillRect(600, 100, 250, 100);
    
    // Cloud cover
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 200 + 50,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    return canvas;
}

// Create shuttle
const shuttle = new Shuttle(scene);

// Create ISS
const iss = new ISS(scene, earth.position);

// Initialize input
InputManager.init();

// HUD update
let frameCount = 0;
let lastFpsTime = Date.now();

function updateHUD() {
    frameCount++;
    const now = Date.now();
    
    if (now - lastFpsTime >= 1000) {
        document.getElementById('fps').textContent = frameCount;
        frameCount = 0;
        lastFpsTime = now;
    }
    
    // Altitude
    const altitude = shuttle.getAltitude(earth.position);
    document.getElementById('altitude').textContent = formatNumber(altitude, 1) + ' km';
    
    // Speed
    const speedKms = shuttle.getSpeed();
    const speedKmh = speedKms * 3600;
    document.getElementById('speed-kms').textContent = speedKms.toFixed(3);
    document.getElementById('speed-kmh').textContent = formatNumber(speedKmh, 0);
    
    // Distance to ISS
    const distanceISS = shuttle.getDistanceTo(iss.position);
    document.getElementById('distance-iss').textContent = formatNumber(distanceISS, 1) + ' km';
}

// Animation loop
let lastTime = Date.now();

function animate() {
    requestAnimationFrame(animate);
    
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;
    
    // Update physics
    PhysicsEngine.update(shuttle, iss, earth, deltaTime);
    
    // Update camera
    cameraController.update(shuttle, deltaTime);
    
    // Update HUD
    updateHUD();
    
    // Render
    renderer.render(scene, cameraController.camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    cameraController.onWindowResize();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Log initial message
console.log('Space Shuttle + ISS Simulator initialized!');
console.log('Controls: WASD to move, Space/Ctrl for vertical thrust, Mouse to look around, Click to lock mouse');
