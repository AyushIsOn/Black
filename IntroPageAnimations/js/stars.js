// Stars implementation extracted from original Bitkraft code
// Preserving exact visual appearance and functionality

// Vertex shader for stars (matches original)
const STARS_VERTEX_SHADER = `
    attribute vec4 aData0; // position.xyz, brightness
    attribute vec4 aData1; // random values for animation
    
    uniform mat4 uViewProjection;
    uniform vec3 uCameraPos;
    uniform float uTime;
    uniform float uScreenHeight;
    uniform float uVisibility;
    uniform float uPointSizeMin;
    uniform float uPointSizeMax;
    uniform float uOpacity;
    
    varying float vOpacity;
    varying vec3 vColor;
    
    void main() {
        vec3 position = aData0.xyz;
        float brightness = aData0.w;
        vec3 randomValues = aData1.xyz;
        
        // Calculate distance from camera
        float distance = length(position - uCameraPos);
        
        // Time-based twinkling animation (preserving original behavior)
        float timeOffset = randomValues.x * 6.28318; // 2π
        float twinkle = sin(uTime * 2.0 + timeOffset) * 0.5 + 0.5;
        twinkle = pow(twinkle, 3.0); // More dramatic twinkling
        
        // Size calculation based on distance and brightness
        float baseSize = mix(uPointSizeMin, uPointSizeMax, brightness);
        float sizeScale = uScreenHeight * 0.005; // Reduced from 0.01 for smaller stars
        gl_PointSize = baseSize * sizeScale * (1.0 + twinkle * 0.5);
        
        // Opacity calculation
        float alpha = brightness * uVisibility * (0.5 + twinkle * 0.5);
        vOpacity = alpha * uOpacity;
        
        // Color variation (slight blue-white tint like original)
        vColor = vec3(0.9 + randomValues.y * 0.1, 0.95 + randomValues.z * 0.05, 1.0);
        
        gl_Position = uViewProjection * vec4(position, 1.0);
    }
`;

// Fragment shader for stars (matches original)
const STARS_FRAGMENT_SHADER = `
    precision mediump float;
    
    varying float vOpacity;
    varying vec3 vColor;
    
    void main() {
        // Create circular point with soft edges
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) {
            discard;
        }
        
        // Soft falloff for glow effect
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        alpha = pow(alpha, 2.0); // More concentrated glow
        
        gl_FragColor = vec4(vColor, alpha * vOpacity);
    }
`;

// Stars class (ec) - extracted with minimal modifications
class Stars {
    constructor(renderer) {
        this.renderer = renderer;
        this.visibleTween = TWEEN_MANAGER.add(new Tween(1.0));
        
        // Create material with original shaders
        this.material = new WebGLMaterial(renderer, STARS_VERTEX_SHADER, STARS_FRAGMENT_SHADER);
        
        // Create mesh with exactly 65,536 stars (matching original)
        this.mesh = this.createMesh(65536);
        
        // Original shader parameters - slightly increased size
        this.pointSizeMin = 0.15;  // Increased from 0.1
        this.pointSizeMax = 0.45;  // Increased from 0.3
        this.opacity = 5.0;
        this.randomColor = 0.25;
    }

    // Original createMesh method with exact same logic
    createMesh(starCount) {
        // Two Float32Arrays for star data (matching original structure)
        const positions = new Float32Array(4 * starCount); // x, y, z, brightness
        const attributes = new Float32Array(4 * starCount); // random values
        
        let positionIndex = 0;
        let attributeIndex = 0;
        const tempVector = new Vector3();
        
        // Generate stars on a full screen rectangular plane with closer spacing
        for (let i = 0; i < starCount; i++) {
            // Random position with reduced spacing for denser stars
            const x = (Math.random() - 0.5) * 30; // Reduced from 50 for closer spacing
            const y = (Math.random() - 0.5) * 25; // Reduced from 40 for closer spacing
            const z = -5 + Math.random() * -15;   // Reduced depth range (z = -5 to -20)
            
            positions[positionIndex++] = x;
            positions[positionIndex++] = y;
            positions[positionIndex++] = z;
            
            // Brightness calculation (original formula)
            const brightness = Math.random();
            positions[positionIndex++] = brightness * brightness * brightness;
            
            // Random attributes for animation
            attributes[attributeIndex++] = Math.random();
            attributes[attributeIndex++] = Math.random();
            attributes[attributeIndex++] = Math.random();
            attributes[attributeIndex++] = 0; // Unused but keeping original structure
        }
        
        // Create mesh and set attributes
        const mesh = new WebGLMesh(this.renderer);
        mesh.setAttribute('aData0', 4, positions);
        mesh.setAttribute('aData1', 4, attributes);
        
        return mesh;
    }

    // Original update method
    update(deltaTime) {
        this.visibleTween.update(deltaTime);
    }

    // Original draw method with same shader parameters
    draw(camera) {
        if (this.visibleTween.value === 0) return;
        
        this.material.use();
        
        // Set uniforms with original values
        this.material.setVector3('uCameraPos', camera.position);
        this.material.setFloat('uTime', Time.instance.time % 100);
        this.material.setFloat('uScreenHeight', this.renderer.height);
        this.material.setFloat('uVisibility', this.visibleTween.value);
        this.material.setMatrix4('uViewProjection', camera.viewProjectionMatrix);
        
        // Original shader parameters
        this.material.setFloat('uPointSizeMin', this.pointSizeMin);
        this.material.setFloat('uPointSizeMax', this.pointSizeMax);
        this.material.setFloat('uOpacity', this.opacity);
        
        this.renderer.draw(this.mesh, this.material);
    }

    // Original visibility control method
    setStarsVisibility(visibility, duration = 1, callback = () => {}) {
        this.visibleTween.to(visibility, duration, null, callback);
    }
}

// Intro Scene Manager (ep) - simplified but preserving stars functionality
class IntroSceneManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.stars = new Stars(renderer);
        this.progress = 0;
    }

    init() {
        // No additional initialization needed for standalone version
    }

    update(deltaTime) {
        this.stars.update(deltaTime);
    }

    draw(camera) {
        this.stars.draw(camera);
    }

    setProgress(progress) {
        this.progress = progress;
        // Could add additional intro effects here if needed
    }
}
