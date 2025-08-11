// Tween system extracted from original implementation
// Preserving smooth transition behavior

class Tween {
    constructor(initialValue = 0) {
        this.value = initialValue;
        this.targetValue = initialValue;
        this.duration = 1.0;
        this.elapsed = 0;
        this.isAnimating = false;
        this.onUpdate = null;
        this.onComplete = null;
    }

    to(targetValue, duration = 1.0, onUpdate = null, onComplete = null) {
        this.targetValue = targetValue;
        this.duration = duration;
        this.elapsed = 0;
        this.isAnimating = true;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        return this;
    }

    update(deltaTime) {
        if (!this.isAnimating) return;

        this.elapsed += deltaTime;
        const progress = Math.min(this.elapsed / this.duration, 1.0);
        
        // Smooth easing (similar to original)
        const eased = this.easeInOutQuad(progress);
        const startValue = this.value;
        this.value = startValue + (this.targetValue - startValue) * eased;

        if (this.onUpdate) {
            this.onUpdate(this.value);
        }

        if (progress >= 1.0) {
            this.value = this.targetValue;
            this.isAnimating = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    // Smooth easing function (matching original behavior)
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}

// Global tween manager
class TweenManager {
    constructor() {
        this.tweens = [];
    }

    add(tween) {
        this.tweens.push(tween);
        return tween;
    }

    update(deltaTime) {
        for (const tween of this.tweens) {
            tween.update(deltaTime);
        }
    }
}

// Global instance
const TWEEN_MANAGER = new TweenManager();
