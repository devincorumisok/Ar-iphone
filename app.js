// Get DOM Elements
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const downloadButton = document.getElementById('downloadButton');
const cameraFeed = document.getElementById('camera-feed');
const canvas = document.getElementById('three-canvas');

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1); // Dark grey background

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10).normalize();
scene.add(directionalLight);

// Add Grid Helper
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

// Orbit Controls for Camera Interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Position the Camera
camera.position.set(10, 10, 20);
controls.update();

// 3D Object Collection
const objects = [];

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Bluetooth & WiFi Variables
let device;
let scanning = false;

// Start Scanning
async function startScanning() {
    startButton.disabled = true;
    stopButton.disabled = false;

    // Initialize Camera Feed
    startCamera();

    // Simulate Bluetooth Scanning
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'BLE' }],
            optionalServices: ['battery_service']
        });
        console.log('Connected to:', device.name);
        scanning = true;
        addRandomSpheres(); // Simulated 3D Mapping
    } catch (error) {
        console.error('Bluetooth connection failed:', error);
    }
}

// Stop Scanning
function stopScanning() {
    if (device && scanning) {
        console.log('Stopped scanning.');
        scanning = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        downloadButton.disabled = false;
        stopCamera();
    }
}

// Initialize Camera Stream
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraFeed.srcObject = stream;
    } catch (error) {
        console.error('Camera access denied:', error);
    }
}

// Stop Camera Stream
function stopCamera() {
    const stream = cameraFeed.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraFeed.srcObject = null;
    }
}

// Generate Random 3D Spheres (Simulating Bluetooth/WiFi Data)
function addRandomSpheres() {
    clearScene();

    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
        );

        scene.add(sphere);
        objects.push(sphere);
    }
}

// Clear Previous 3D Objects
function clearScene() {
    objects.forEach(obj => scene.remove(obj));
    objects.length = 0;
}

// Download 3D Model as OBJ File
function downloadModel() {
    const exporter = new THREE.OBJExporter();
    const objData = exporter.parse(scene);

    const blob = new Blob([objData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = '3d-model.obj';
    a.click();

    URL.revokeObjectURL(url);
}

// Event Listeners
startButton.addEventListener('click', startScanning);
stopButton.addEventListener('click', stopScanning);
downloadButton.addEventListener('click', downloadModel);
