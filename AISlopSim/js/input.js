/**
 * Input handler for keyboard and mouse controls
 */

const InputManager = {
    keys: {},
    mouse: {
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
        locked: false
    },
    
    init() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onMouseClick(e));
        window.addEventListener('pointerlockchange', (e) => this.onPointerLockChange(e));
        
        // Prevent context menu
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    onKeyDown(event) {
        this.keys[event.key.toLowerCase()] = true;
    },
    
    onKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    },
    
    onMouseMove(event) {
        const sensitivity = 0.002;
        
        if (this.mouse.locked) {
            this.mouse.deltaX = event.movementX * sensitivity;
            this.mouse.deltaY = event.movementY * sensitivity;
        } else {
            this.mouse.deltaX = 0;
            this.mouse.deltaY = 0;
        }
        
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    },
    
    onMouseClick() {
        if (!this.mouse.locked) {
            document.body.requestPointerLock();
        }
    },
    
    onPointerLockChange() {
        this.mouse.locked = document.pointerLockElement === document.body;
    },
    
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    },
    
    getMovementInput() {
        const input = { x: 0, y: 0, z: 0 };
        
        if (this.isKeyPressed('w')) input.z -= 1;
        if (this.isKeyPressed('s')) input.z += 1;
        if (this.isKeyPressed('a')) input.x -= 1;
        if (this.isKeyPressed('d')) input.x += 1;
        if (this.isKeyPressed(' ')) input.y += 1;
        if (this.isKeyPressed('control')) input.y -= 1;
        
        return input;
    },
    
    getMouseDelta() {
        const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        return delta;
    }
};
