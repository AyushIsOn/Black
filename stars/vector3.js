// Vector3 class extracted from original Bitkraft implementation
// Minimal modifications - preserving original functionality

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    normalize() {
        const length = this.length();
        if (length > 0) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
        }
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    // Generate random point on sphere surface (original method)
    randomizeSphere() {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        
        this.x = Math.sin(phi) * Math.cos(theta);
        this.y = Math.sin(phi) * Math.sin(theta);
        this.z = Math.cos(phi);
        
        return this;
    }

    randomize01() {
        this.x = Math.random();
        this.y = Math.random();
        this.z = Math.random();
        return this;
    }
}
