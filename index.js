// globals
var triangleDrawer;
var meshDrawer;
var boxDrawer;
var canvas, gl;
var perspectiveMatrix; // perspective projection matrix
var rotX=0, rotY=0, transZ=3, autoRotate=0;

function InitWebGL() {
    canvas = document.getElementById("canvas");
    gl = canvas.getContext('webgl', {antialias: false});
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    // Initialize settings
    gl.clearColor(0.0, 0.0, 0.0, 0.0); // Black, fully opaque
    gl.enable(gl.DEPTH_TEST); // Enable depth testing

    // initialize buffers and shader programs
    triangleDrawer = new TriangleDrawer();
    rectangleDrawer = new RectangleDrawer();
    boxDrawer = new BoxDrawer();

    UpdateCanvasSize();
}

function UpdateCanvasSize() {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    const width = (canvas.width / pixelRatio);
    const height = (canvas.height / pixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);

    // update projection matrix to account for new canvas size
    UpdateProjectionMatrix();
}

function UpdateProjectionMatrix()
{
    // r is the aspect ratio
    var r = canvas.width / canvas.height;
    // n is the near clipping plane
    var n = (transZ - 1.74);
    // n shouldn't be nearer that 0.001
    const min_n = 0.001;
    if (n < min_n) n = min_n;
    // f is the far clipping plane
    var f = (transZ + 1.74);
    var fov = 3.145 * 60 / 180; // field of view be 60 degrees
    // s is the scale factor
    var s = 1 / Math.tan(fov / 2);
    perspectiveMatrix = [
        s/r, 0, 0, 0,
        0, s, 0, 0,
        0, 0, (n+f)/(f-n), 1,
        0, 0, -2*n*f/(f-n), 0
    ]
}

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ)
{
    var trans = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ]

    return MatrixMult(projectionMatrix, trans);
}

function MatrixMult(A, B) {
    var C = [];
	for ( var i=0; i<4; ++i ) {
		for ( var j=0; j<4; ++j ) {
			var v = 0;
			for ( var k=0; k<4; ++k ) {
				v += A[j+4*k] * B[k+4*i];
			}
			C.push(v);
		}
	}
	return C;
}

function InitShaderProgram(vsSource, fsSource, wgl=gl) {
    const vs = CompileShader(wgl.VERTEX_SHADER, vsSource, wgl);
    const fs = CompileShader(wgl.FRAGMENT_SHADER, fsSource, wgl);
    if (!vs || !fs) {
        console.error("Failed to compile shaders");
        return null;
    }

    const program = wgl.createProgram();
    wgl.attachShader(program, vs);
    wgl.attachShader(program, fs);
    wgl.linkProgram(program);

    if (!wgl.getProgramParameter(program, wgl.LINK_STATUS)) {
        console.error("Error linking program:", wgl.getProgramInfoLog(program));
        wgl.deleteProgram(program);
        return null;
    }

    return program;
}

function CompileShader(type, source, wgl=gl) {
    const shader = wgl.createShader(type);
    wgl.shaderSource(shader, source);
    wgl.compileShader(shader);
    if (!wgl.getShaderParameter(shader, wgl.COMPILE_STATUS)) {
        console.error("Error compiling shader:", wgl.getShaderInfoLog(shader));
        wgl.deleteShader(shader);
        return null;
    }
    return shader;
}

function DrawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // triangleDrawer.draw();
    // rectangleDrawer.draw();
    var mvp = GetModelViewProjection(perspectiveMatrix, 0, 0, transZ);
    boxDrawer.draw(mvp);
}

window.onload = function () {
    InitWebGL();
    DrawScene();
}
