// Flow Fields - Creates flowing line patterns with smooth trajectories
export class FlowFields {
    static name = "Flow Fields";
    static description = "Smooth, flowing lines that create organic patterns across the canvas";

    static getConfig() {
        return {
            colorPalette: [
                '#264653', // Deep blue
                '#2a9d8f', // Teal
                '#e76f51', // Terracotta
                '#bc6c25', // Rust
                '#457b9d', // Steel blue
                '#6d597a', // Muted purple
            ],
            lineWidths: [1, 2, 3],
            numObjects: 30,
            bounds: 14,
            changeDirectionProbability: 0.02,
            speed: 0.1,
            minDistanceForTrail: 0.2,
            opacity: 0.6
        };
    }

    static initializeObject(config) {
        const edge = Math.floor(Math.random() * 4);
        const pos = (Math.random() - 0.5) * (config.bounds * 2);
        const position = new THREE.Vector3();
        
        switch(edge) {
            case 0: position.set(-config.bounds, pos, 0); break;  // Left
            case 1: position.set(config.bounds, pos, 0); break;   // Right
            case 2: position.set(pos, -config.bounds, 0); break;  // Bottom
            case 3: position.set(pos, config.bounds, 0); break;   // Top
        }

        return {
            position: position,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * config.speed,
                (Math.random() - 0.5) * config.speed,
                0
            ),
            lastPoint: position.clone()
        };
    }

    static updateObject(obj, config) {
        // Change direction occasionally
        if (Math.random() < config.changeDirectionProbability) {
            console.log('Changing direction for object');
            const angle = Math.random() * Math.PI * 2;
            obj.velocity.set(
                Math.cos(angle) * config.speed,
                Math.sin(angle) * config.speed,
                0
            );
        }

        // Update position
        obj.position.add(obj.velocity);

        // Bounce off bounds
        if (Math.abs(obj.position.x) > config.bounds) {
            console.log('Bouncing off X boundary');
            obj.position.x = Math.sign(obj.position.x) * config.bounds;
            obj.velocity.x *= -1;
        }
        if (Math.abs(obj.position.y) > config.bounds) {
            console.log('Bouncing off Y boundary');
            obj.position.y = Math.sign(obj.position.y) * config.bounds;
            obj.velocity.y *= -1;
        }

        return obj.position.distanceTo(obj.lastPoint) > config.minDistanceForTrail;
    }
} 