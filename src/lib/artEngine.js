import { FlowFields } from './algorithms/flowFields.js';

export class ArtEngine {
    constructor() {
        console.log('Starting with simple test...');
        
        // Basic Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-15, 15, 15, -15, 1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Set up renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff, 1);
        document.body.appendChild(this.renderer.domElement);

        // Add a simple test square
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(geometry, material);
        this.scene.add(plane);

        // Position camera
        this.camera.position.z = 10;
        this.camera.lookAt(0, 0, 0);

        // Start animation
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
} 