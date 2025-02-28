// Get DOM Elements
const connectButton = document.getElementById('connectButton');
const canvas = document.getElementById('three-canvas');

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add a Basic Cube to Represent Bluetooth Device Position
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Bluetooth Connection Logic
async function connectBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'BLE' }],
            optionalServices: ['battery_service']
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('battery_service');
        const characteristic = await service.getCharacteristic('battery_level');

        // Read Initial Battery Level
        const value = await characteristic.readValue();
        console.log('Battery Level: ' + value.getUint8(0) + '%');

        // Update 3D Object Position Based on Bluetooth Signal (Mock Example)
        device.addEventListener('gattserverdisconnected', () => {
            console.log('Device disconnected');
            cube.position.set(0, 0, 0); // Reset position
        });

        // Example: Moving the Cube Based on Signal Strength (Mocking Movement)
        setInterval(() => {
            const randomPosition = (Math.random() - 0.5) * 10;
            cube.position.x = randomPosition;
            cube.position.y = randomPosition;
        }, 1000);

    } catch (error) {
        console.error('Bluetooth connection failed:', error);
    }
}

// Button Click Event
connectButton.addEventListener('click', connectBluetooth);
