class VisualManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false // Disable transparency if not needed
        });
        this.time = 0;
        this.objects = [];
        this.trails = [];
        this.objectPool = [];
        
        // Static horizontal plane
        this.planeNormal = new THREE.Vector3(0, 1, 0);
        this.planeY = 0; // Plane at y=0
        
        // Add mouse control variables
        this.mousePosition = new THREE.Vector2();
        this.targetCameraPosition = new THREE.Vector3(20, 30, 20);
        this.isDragging = false;
        this.dragStart = new THREE.Vector2();
        this.spherical = new THREE.Spherical(
            40, // radius
            Math.PI / 2, // phi (horizontal view)
            0  // theta (centered)
        );
        
        // Track how many marks each object has made
        this.markCounts = new Map();
        
        // Track diagonal movers
        this.diagonalMovers = 0;
        this.maxDiagonalMovers = 2;

        // Softer color palette
        this.colorPalette = [
            '#264653', // Deep blue
            '#2a9d8f', // Teal
            '#e76f51', // Terracotta
            '#bc6c25', // Rust
            '#457b9d', // Steel blue
            '#6d597a', // Muted purple
        ].map(color => new THREE.Color(color));

        // Line settings
        this.lineWidths = [1, 2, 3];
        this.numObjects = 30;
        
        // Movement patterns
        this.patterns = ['hatch', 'crosshatch', 'curve', 'stipple'];
        
        // Track pattern state
        this.patternState = new Map();

        this.isFinished = false;
        this.createControls();
        this.init();
        this.setupMouseControls();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff, 1);
        document.body.appendChild(this.renderer.domElement);

        // Create canvas plane
        const planeGeometry = new THREE.PlaneGeometry(30, 30);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.scene.add(this.plane);

        // Create objects using pooling
        for (let i = 0; i < this.numObjects; i++) {
            let mesh = this.objectPool.pop();
            if (!mesh) {
                const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const material = new THREE.MeshBasicMaterial({
                    color: this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)],
                    transparent: true,
                    opacity: 0.8
                });
                mesh = new THREE.Mesh(geometry, material);
            }
            
            // Start at random edge position
            const edge = Math.floor(Math.random() * 4);
            const pos = (Math.random() - 0.5) * 28;
            switch(edge) {
                case 0: mesh.position.set(-14, pos, 0); break;  // Left
                case 1: mesh.position.set(14, pos, 0); break;   // Right
                case 2: mesh.position.set(pos, -14, 0); break;  // Bottom
                case 3: mesh.position.set(pos, 14, 0); break;   // Top
            }

            mesh.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                0
            );
            mesh.lineWidth = this.lineWidths[Math.floor(Math.random() * this.lineWidths.length)];
            mesh.color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
            mesh.lastPoint = mesh.position.clone();

            this.objects.push(mesh);
            this.scene.add(mesh);
        }

        // Set up camera
        this.camera.position.set(0, 0, 40);
        this.camera.lookAt(0, 0, 0);
    }

    setupMouseControls() {
        // Mouse move for camera rotation
        this.handleMouseMove = this.handleMouseMove.bind(this);

        // Mouse wheel for zoom
        this.handleMouseWheel = this.handleMouseWheel.bind(this);

        // Mouse down for rotation
        this.handleMouseDown = this.handleMouseDown.bind(this);

        // Mouse up to stop rotation
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Mouse leave to stop rotation
        this.handleMouseLeave = this.handleMouseLeave.bind(this);

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('wheel', this.handleMouseWheel);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mouseleave', this.handleMouseLeave);
    }

    handleMouseMove(event) {
        this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (this.isDragging) {
            const deltaX = event.clientX - this.dragStart.x;
            const deltaY = event.clientY - this.dragStart.y;

            // Update spherical coordinates
            this.spherical.theta -= deltaX * 0.01;
            this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, 
                this.spherical.phi + deltaY * 0.01));

            this.dragStart.set(event.clientX, event.clientY);
        }
    }

    handleMouseWheel(event) {
        this.spherical.radius = Math.max(10, Math.min(100,
            this.spherical.radius + event.deltaY * 0.1));
    }

    handleMouseDown(event) {
        this.isDragging = true;
        this.dragStart.set(event.clientX, event.clientY);
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleMouseLeave() {
        this.isDragging = false;
    }

    updateCamera() {
        // Convert spherical coordinates to Cartesian
        const sinPhiRadius = Math.sin(this.spherical.phi) * this.spherical.radius;
        const targetPosition = new THREE.Vector3(
            sinPhiRadius * Math.sin(this.spherical.theta),
            this.spherical.radius * Math.cos(this.spherical.phi),
            sinPhiRadius * Math.cos(this.spherical.theta)
        );

        // Smooth camera movement
        this.camera.position.lerp(targetPosition, 0.1);
        this.camera.lookAt(0, 0, 0);

        // Tilt camera based on mouse Y position when not dragging
        if (!this.isDragging) {
            const tiltAngle = this.mousePosition.y * 0.2;
            this.camera.position.y += tiltAngle;
        }
    }

    createControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
        `;

        const newArtButton = document.createElement('button');
        newArtButton.innerHTML = 'New Artwork';
        newArtButton.style.cssText = this.getButtonStyle();
        newArtButton.addEventListener('click', () => this.resetArtwork());

        const saveButton = document.createElement('button');
        saveButton.innerHTML = 'Save Artwork';
        saveButton.style.cssText = this.getButtonStyle();
        saveButton.addEventListener('click', () => this.saveArtwork());

        controls.appendChild(newArtButton);
        controls.appendChild(saveButton);
        document.body.appendChild(controls);
    }

    getButtonStyle() {
        return `
            padding: 12px 24px;
            background: #2a9d8f;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
    }

    resetArtwork() {
        // Remove all existing objects and trails
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            this.objectPool.push(obj); // Return to pool
        });
        this.trails.forEach(trail => this.scene.remove(trail.line));
        this.objects = [];
        this.trails = [];
        this.visitedCells = new Set();
        this.diagonalMovers = 0;

        // Create new objects
        this.init();
    }

    saveArtwork() {
        try {
            // Create a temporary camera for orthographic capture of just the square
            const tempCamera = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 1000);
            tempCamera.position.set(0, 0, 40);
            tempCamera.lookAt(0, 0, 0);

            // Set up temporary renderer for high-res capture
            const size = 2000; // High resolution output
            const tempRenderer = new THREE.WebGLRenderer({ 
                antialias: true,
                preserveDrawingBuffer: true
            });
            tempRenderer.setSize(size, size);
            tempRenderer.setClearColor(0xffffff, 1);

            // Render the scene
            tempRenderer.render(this.scene, tempCamera);

            // Get the image data
            const imgData = tempRenderer.domElement.toDataURL('image/jpeg', 1.0);

            // Create download link
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'artwork.jpg';
            link.click();
        } catch (error) {
            console.error('Error saving artwork:', error);
        }
    }

    createTrailLine(points, color, width) {
        if (points.length < 2) return; // Ensure valid points
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.6,
            linewidth: width
        });
        
        const line = new THREE.Line(geometry, material);
        this.trails.push(line);
        this.scene.add(line);
    }

    updateObjects() {
        const bounds = 14;

        this.objects.forEach(obj => {
            // Change direction occasionally
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.1;
                obj.velocity.set(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    0
                );
            }

            // Update position
            obj.position.add(obj.velocity);

            // Bounce off bounds
            if (Math.abs(obj.position.x) > bounds) {
                obj.position.x = Math.sign(obj.position.x) * bounds;
                obj.velocity.x *= -1;
            }
            if (Math.abs(obj.position.y) > bounds) {
                obj.position.y = Math.sign(obj.position.y) * bounds;
                obj.velocity.y *= -1;
            }

            // Create trail
            const distance = obj.position.distanceTo(obj.lastPoint);
            if (distance > 0.2) {
                this.createTrailLine([
                    obj.lastPoint.clone(),
                    obj.position.clone()
                ], obj.color, obj.lineWidth);
                obj.lastPoint = obj.position.clone();
            }
        });
    }

    animate() {
        this.time += 0.01;
        this.updateObjects();
        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    dispose() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('wheel', this.handleMouseWheel);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
    }
} 