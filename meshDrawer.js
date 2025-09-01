class MeshDrawer
{
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);

        this.pos = gl.getAttribLocation(this.prog, "pos");
        this.texCoord = gl.getAttribLocation(this.prog, "texCoord");

        this.mvp = gl.getUniformLocation(this.prog, "mvp");
        this.yzSwap = gl.getUniformLocation(this.prog, "yzSwap");
        this.showTex = gl.getUniformLocation(this.prog, "showTex");
        this.tex = gl.getUniformLocation(this.prog, "tex");

        this.vertexbuffer = gl.createBuffer();
        this.texBuffer = gl.createBuffer();
        
        this.texture = gl.createTexture();

        this.numTriangles = 0;
        
        this.yz = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    }

    // Bind the vertex and texture buffer with data
    setMesh(vertexPos, texCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        this.numTriangles = vertexPos.length / 3;
    }

    // swap the yz axis according to the checkbox in UI
    swapYZ(swap) {
        if (swap) {
            this.yz = MatrixMult(
                [
                    1, 0, 0, 0,
                    0, -1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ],
                [
                    1, 0, 0, 0,
					0, Math.cos(Math.PI / 2), Math.sin(Math.PI / 2), 0,
					0, -Math.sin(Math.PI / 2), Math.cos(Math.PI / 2), 0,
					0, 0, 0, 1
                ]
            );
        } else {
            this.yz = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]
        }
    }

    // draw the triangular mesh
    // takes in the transformation matrix from GetModelViewProjection
    draw(trans) {
        gl.useProgram(this.prog);
        
        gl.uniformMatrix4fv(this.mvp, false, trans);
        gl.uniformMatrix4fv(this.yzSwap, false, this.yz);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.pos);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.vertexAttribPointer(this.texCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.texCoord);

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles * 3);
    }

    // add a texture to the mesh
    setTexture(img) {
        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // set texture image data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

        // set texture parameters
        gl.generateMinmap(gl.TEXTURE_2D)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MINMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        // set uniform parameters for Fragment Shader
        const sampler = gl.getUniformLocation(this.prog, "tex");
        gl.uniform1i(sampler, 0);
    }

    // Show texture or not
    showTexture(show)
    {
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTex, show);
    }
}

const meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;

    uniform mat4 mvp;
    uniform mat4 yzSwap;

    varying vec2 v_texCoord;

    void main()
    {
        v_texCoord = texCoord;

        gl_Position = mvp * yzSwap * vec4(pos, 1.0);
    }
`;

const meshFS = `
    precision mediump float;

    uniform bool showTex;
    uniform sampler2D tex;

    varying vec2 v_texCoord;

    void main()
    {
        if (showTex)
        {
            gl_FragColor = texture2D(tex, v_texCoord);
        }
        else
        {
            gl_FragColor = vec4(1.0, gl_FragCoord.z * gl_FragCoord.z, 0.0, 1.0);
        }
    }
`;