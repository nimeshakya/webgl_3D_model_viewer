class TriangleDrawer
{
    constructor() {
        // initialize shader program
        this.prog = InitShaderProgram(triangleVS, triangleFS);

        this.mvp = gl.getUniformLocation(this.prog, "mvp");

        this.verPos = gl.getAttribLocation(this.prog, "pos");

        // create the buffer objects
        // vertex positions buffer
        this.vertexbuffer = gl.createBuffer();
        var pos = [
            0, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

        // edge line buffer
        this.linebuffer = gl.createBuffer();
        var line = [
            0,1, 1,2, 2,0
        ]
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linebuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(line), gl.STATIC_DRAW);
    }

    draw() {
        // draw the line segments
        gl.useProgram(this.prog);
        gl.uniformMatrix4fv(this.mvp, false, [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.vertexAttribPointer(this.verPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.verPos);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linebuffer);
        gl.drawElements(gl.LINES, 6, gl.UNSIGNED_BYTE, 0);
    }
}

var triangleVS = `
    attribute vec3 pos;
    uniform mat4 mvp;

    void main() {
        gl_Position = mvp * vec4(pos, 1);
    }
`

var triangleFS = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`