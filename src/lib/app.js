let visualManager;
let animationFrame;

function init() {
    visualManager = new VisualManager();
    animate();
}

function animate() {
    visualManager.animate();
    animationFrame = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    if (visualManager) {
        visualManager.handleResize();
    }
});

// Initialize on load
window.addEventListener('load', init); 