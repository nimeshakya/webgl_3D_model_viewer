class MeshDrawer
{
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        gl.useProgram(this.prog);

        this.mvp = gl.getUniformLocation(this.prog, "mvp");
        this.mv = gl.getUniformLocation(this.prog, "mv");
        this.matrixNormal = gl.getUniformLocation(this.prog, "matrixNormal");
        this.yzSwap = gl.getUniformLocation(this.prog, "yzSwap");
        this.showTex = gl.getUniformLocation(this.prog, "showTex");
        this.tex = gl.getUniformLocation(this.prog, "tex");
        this.lightDir = gl.getUniformLocation(this.prog, "lightDir");
        this.shininess = gl.getUniformLocation(this.prog, "shininess");

        this.pos = gl.getAttribLocation(this.prog, "pos");
        this.normal = gl.getAttribLocation(this.prog, "normal");
        this.texCoord = gl.getAttribLocation(this.prog, "texCoord");


        this.vertexbuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
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
    setMesh(vertexPos, texCoords, normals) {
        gl.useProgram(this.prog);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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
    draw(matrixMVP, matrixMV, matrixNormal) {
        gl.useProgram(this.prog);

        gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
        gl.uniformMatrix4fv(this.mv, false, matrixMV);
        gl.uniformMatrix3fv(this.matrixNormal, false, matrixNormal);
        gl.uniformMatrix4fv(this.yzSwap, false, this.yz);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
        gl.enableVertexAttribArray(this.pos);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.enableVertexAttribArray(this.normal);
        gl.vertexAttribPointer(this.normal, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.enableVertexAttribArray(this.texCoord);
        gl.vertexAttribPointer(this.texCoord, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    // add a texture to the mesh
    setTexture(img) {
        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // set texture image data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

        // set texture parameters
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        // set uniform parameters for Fragment Shader
        gl.uniform1i(this.tex, 0);
    }

    // Show texture or not
    showTexture(show)
    {
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTex, show);
    }

    // Set the incoming light direction
    setLightDir(x, y, z) {
        gl.useProgram(this.prog);

        const length = Math.sqrt(x*x + y*y + z*z);
        const nx = x / length;
        const ny = y / length;
        const nz = z / length;

        gl.uniform3f(this.lightDir, nx, ny, nz);
    }

    setShininess(s) {
        gl.useProgram(this.prog);
        gl.uniform1f(this.shininess, s);
    }
}

const meshVS = `
    attribute vec3 pos;
    attribute vec2 texCoord;
    attribute vec3 normal;

    uniform mat4 mvp;
    uniform mat4 mv;
    uniform mat4 yzSwap;
    uniform mat3 matrixNormal;

    varying vec2 v_texCoord;
    varying vec3 v_normal;
    varying vec3 v_fragPos;

    void main()
    {
        v_texCoord = texCoord;
        v_normal = matrixNormal * normal;
        vec4 fragPos = mv * yzSwap * vec4(pos, 1.0);
        v_fragPos = fragPos.xyz;
        gl_Position = mvp * yzSwap * vec4(pos, 1.0);
    }
`;

const meshFS = `
    precision mediump float;

    uniform bool showTex;
    uniform sampler2D tex;
    uniform vec3 lightDir;
    uniform float shininess;

    varying vec2 v_texCoord;
    varying vec3 v_normal;
    varying vec3 v_fragPos;

    void main()
    {
        if (showTex)
        {
            vec3 norm = normalize(v_normal);
            vec3 light = normalize(lightDir);
            vec3 viewDir = normalize(-v_fragPos); // camera at origin

            // Diffuse
            float diff = max(dot(norm, light), 0.0);

            // specular
            vec3 reflectDir = reflect(-light, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);

            vec3 baseColor = texture2D(tex, v_texCoord).rgb;
            vec3 ambientLight = 0.2 * baseColor;
            vec3 result = baseColor * diff + vec3(spec) + ambientLight;

            gl_FragColor = vec4(result, 1.0);
        }
        else
        {
            // depth based coloring
            gl_FragColor = vec4(1.0, gl_FragCoord.z * gl_FragCoord.z, 0.0, 1.0);
        }
    }
`;