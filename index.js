// globals
var canvas, gl, triangleDrawer;

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

    // redraw to update scene
    DrawScene();
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
    rectangleDrawer.draw();
}

window.onload = function () {
    InitWebGL();
    DrawScene();
}
