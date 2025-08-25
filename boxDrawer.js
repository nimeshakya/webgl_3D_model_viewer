class BoxDrawer
{
    constructor() {
        // Initialize Shader Program
        this.prog = InitShaderProgram(boxVS, boxFS);

        // Initialize uniform locations
        this.mvp = gl.getUniformLocation(this.prog, "mvp");
        
        // Initialze attribute locations
        this.pos = gl.getAttribLocation(this.prog, "position");

        // Create buffer objects
        // Vertex Position Buffer
        this.vertexbuffer = gl.createBuffer();
        var pos = [
            -1, -1, -1,
            -1, -1,  1,
			-1,  1, -1,
			-1,  1,  1,
			1, -1, -1,
			1, -1,  1,
			1,  1, -1,
			1,  1,  1
        ]
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

        // Index buffer
        this.indexbuffer = gl.createBuffer();
        var indices = [
            0,1,   1,3,   3,2,   2,0,
			4,5,   5,7,   7,6,   6,4,
			0,4,   1,5,   3,7,   2,6
        ]
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexbuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    }

    draw(trans)
    {
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.mvp, false, trans);

        // bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.pos);

        // draw the box
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexbuffer);
        gl.drawElements(gl.LINES, 24, gl.UNSIGNED_BYTE, 0);
    }
}

var boxVS = `
    uniform mat4 mvp;

    attribute vec3 position;

    void main() {
        gl_Position = mvp * vec4(position, 1.0);
    }
`;


var boxFS = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
`;
