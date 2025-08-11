// Minimal WebGL core system extracted from original implementation
// Only essential functionality preserved

class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.width = 0;
        this.height = 0;
        this.aspectRatio = 1;
        
        this.resize();
        this.setupGL();
        
        // Listen for resize
        window.addEventListener('resize', () => this.resize());
    }

    setupGL() {
        const gl = this.gl;
        
        // Enable blending for additive effect
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending
        
        // Clear color (black background)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        // Enable depth testing
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    resize() {
        const pixelRatio = window.devicePixelRatio || 1;
        this.width = this.canvas.clientWidth * pixelRatio;
        this.height = this.canvas.clientHeight * pixelRatio;
        this.aspectRatio = this.width / this.height;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.gl.viewport(0, 0, this.width, this.height);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    draw(mesh, material) {
        material.use();
        mesh.bind();
        this.gl.drawArrays(this.gl.POINTS, 0, mesh.vertexCount);
    }
}

class WebGLMaterial {
    constructor(renderer, vertexShaderSource, fragmentShaderSource) {
        this.gl = renderer.gl;
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.uniforms = {};
        this.attributes = {};
        
        this.getUniformLocations();
        this.getAttributeLocations();
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    getUniformLocations() {
        const gl = this.gl;
        const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        
        for (let i = 0; i < uniformCount; i++) {
            const uniformInfo = gl.getActiveUniform(this.program, i);
            this.uniforms[uniformInfo.name] = gl.getUniformLocation(this.program, uniformInfo.name);
        }
    }

    getAttributeLocations() {
        const gl = this.gl;
        const attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        
        for (let i = 0; i < attributeCount; i++) {
            const attributeInfo = gl.getActiveAttrib(this.program, i);
            this.attributes[attributeInfo.name] = gl.getAttribLocation(this.program, attributeInfo.name);
        }
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setFloat(name, value) {
        if (this.uniforms[name] !== undefined) {
            this.gl.uniform1f(this.uniforms[name], value);
        }
    }

    setVector3(name, vector) {
        if (this.uniforms[name] !== undefined) {
            this.gl.uniform3f(this.uniforms[name], vector.x, vector.y, vector.z);
        }
    }

    setMatrix4(name, matrix) {
        if (this.uniforms[name] !== undefined) {
            this.gl.uniformMatrix4fv(this.uniforms[name], false, matrix);
        }
    }
}

class WebGLMesh {
    constructor(renderer) {
        this.gl = renderer.gl;
        this.buffers = {};
        this.vertexCount = 0;
    }

    setAttribute(name, size, data) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        
        this.buffers[name] = {
            buffer: buffer,
            size: size,
            type: gl.FLOAT,
            normalized: false,
            stride: 0,
            offset: 0
        };
        
        this.vertexCount = data.length / size;
    }

    bind() {
        const gl = this.gl;
        
        for (const [name, bufferInfo] of Object.entries(this.buffers)) {
            const location = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), name);
            if (location >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(
                    location,
                    bufferInfo.size,
                    bufferInfo.type,
                    bufferInfo.normalized,
                    bufferInfo.stride,
                    bufferInfo.offset
                );
            }
        }
    }
}

// Camera class for view/projection matrices
class Camera {
    constructor() {
        this.position = new Vector3(0, 0, 5);
        this.target = new Vector3(0, 0, 0);
        this.up = new Vector3(0, 1, 0);
        
        this.fov = 45;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 100;
        
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);
        this.viewProjectionMatrix = new Float32Array(16);
        
        this.updateMatrices();
    }

    updateMatrices() {
        this.createLookAtMatrix(this.viewMatrix, this.position, this.target, this.up);
        this.createPerspectiveMatrix(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);
        this.multiplyMatrices(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }

    createLookAtMatrix(out, eye, center, up) {
        const x0 = eye.x, x1 = center.x, x2 = up.x;
        const y0 = eye.y, y1 = center.y, y2 = up.y;
        const z0 = eye.z, z1 = center.z, z2 = up.z;
        
        const fx = x1 - x0;
        const fy = y1 - y0;
        const fz = z1 - z0;
        
        const rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
        const fx_n = fx * rlf;
        const fy_n = fy * rlf;
        const fz_n = fz * rlf;
        
        const sx = fy_n * z2 - fz_n * y2;
        const sy = fz_n * x2 - fx_n * z2;
        const sz = fx_n * y2 - fy_n * x2;
        
        const rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
        const sx_n = sx * rls;
        const sy_n = sy * rls;
        const sz_n = sz * rls;
        
        const ux = sy_n * fz_n - sz_n * fy_n;
        const uy = sz_n * fx_n - sx_n * fz_n;
        const uz = sx_n * fy_n - sy_n * fx_n;
        
        out[0] = sx_n;
        out[1] = ux;
        out[2] = -fx_n;
        out[3] = 0;
        out[4] = sy_n;
        out[5] = uy;
        out[6] = -fy_n;
        out[7] = 0;
        out[8] = sz_n;
        out[9] = uz;
        out[10] = -fz_n;
        out[11] = 0;
        out[12] = -(sx_n * x0 + sy_n * y0 + sz_n * z0);
        out[13] = -(ux * x0 + uy * y0 + uz * z0);
        out[14] = fx_n * x0 + fy_n * y0 + fz_n * z0;
        out[15] = 1;
    }

    createPerspectiveMatrix(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy * Math.PI / 180 / 2);
        const nf = 1 / (near - far);
        
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = 2 * far * near * nf;
        out[15] = 0;
    }

    multiplyMatrices(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        
        const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
        const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
        const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
        const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];
        
        out[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        out[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        out[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        out[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        out[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        out[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        out[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        out[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        out[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        out[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        out[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        out[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        out[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        out[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
    }
}
