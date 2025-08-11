// Main application - minimal setup to run the stars system
class StarsApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.renderer = null;
        this.camera = null;
        this.introScene = null;
        this.isRunning = false;
        
        this.setupCanvas();
        this.initWebGL();
        this.setupControls();
        this.start();
    }

    setupCanvas() {
        // Make canvas fill the container
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
    }

    initWebGL() {
        try {
            // Initialize renderer
            this.renderer = new WebGLRenderer(this.canvas);
            
            // Setup camera (matching original position)
            this.camera = new Camera();
            this.camera.position.set(0, 0, 8); // Original camera distance
            this.camera.aspect = this.renderer.aspectRatio;
            this.camera.updateMatrices();
            
            // Create intro scene with stars
            this.introScene = new IntroSceneManager(this.renderer);
            this.introScene.init();
            
            console.log('WebGL initialized successfully');
            console.log('Stars count: 65,536');
            
        } catch (error) {
            console.error('Failed to initialize WebGL:', error);
            this.showError('WebGL initialization failed. Your browser may not support WebGL.');
        }
    }

    setupControls() {
        // Visibility control
        const visibilitySlider = document.getElementById('visibilitySlider');
        const visibilityValue = document.getElementById('visibilityValue');
        
        visibilitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            visibilityValue.textContent = value.toFixed(1);
            if (this.introScene) {
                this.introScene.stars.setStarsVisibility(value, 0.5);
            }
        });

        // Animation speed control
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            speedValue.textContent = value.toFixed(1);
            Time.instance.setTimeScale(value);
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            visibilitySlider.value = 1.0;
            speedSlider.value = 1.0;
            visibilityValue.textContent = '1.0';
            speedValue.textContent = '1.0';
            
            Time.instance.setTimeScale(1.0);
            if (this.introScene) {
                this.introScene.stars.setStarsVisibility(1.0, 1.0);
            }
        });

        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.resize();
                this.camera.aspect = this.renderer.aspectRatio;
                this.camera.updateMatrices();
            }
        });

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            // Small delay to ensure proper resize
            setTimeout(() => {
                if (this.renderer) {
                    this.renderer.resize();
                    this.camera.aspect = this.renderer.aspectRatio;
                    this.camera.updateMatrices();
                }
            }, 100);
        });
    }

    start() {
        if (!this.renderer || !this.camera || !this.introScene) {
            console.error('Cannot start - initialization failed');
            return;
        }

        this.isRunning = true;
        this.render();
        console.log('Stars animation started');
    }

    stop() {
        this.isRunning = false;
    }

    render() {
        if (!this.isRunning) return;

        // Update tweens
        TWEEN_MANAGER.update(Time.instance.deltaTime);
        
        // Update scene
        this.introScene.update(Time.instance.deltaTime);
        
        // Clear and render
        this.renderer.clear();
        this.introScene.draw(this.camera);
        
        // Continue animation loop
        requestAnimationFrame(() => this.render());
    }

    showError(message) {
        const canvas = document.getElementById('canvas');
        canvas.style.display = 'none';
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff6b6b;
            font-size: 18px;
            text-align: center;
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Show loading message
    console.log('Initializing Bitkraft Stars System...');
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        try {
            window.starsApp = new StarsApp();
        } catch (error) {
            console.error('Failed to start application:', error);
        }
    }, 100);
});
