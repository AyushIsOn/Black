// Time management system extracted from original implementation
// Preserving exact timing behavior

class Time {
    static instance = new Time();

    constructor() {
        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.deltaTime = 0;
        this.time = 0;
        this.timeScale = 1.0;
        
        this.update();
    }

    update() {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.time = (currentTime - this.startTime) / 1000 * this.timeScale;
        this.lastTime = currentTime;
        
        // Continue the update loop
        requestAnimationFrame(() => this.update());
    }

    setTimeScale(scale) {
        this.timeScale = scale;
    }
}
