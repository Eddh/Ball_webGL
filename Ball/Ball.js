// Ball.js

var gl;
var shaderProgram;
var squareVertexArrayBuffer;
var squareIndexBuffer;
var sphereVertexArrayBuffer;
var sphereIndexBuffer;
var sphereColorBuffer;
var mvMatrix = mat4.create();
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var pMatrix = mat4.create();
var normalMatrix = mat3.create();
var lightDir = [1, 0.5, 1.3];

// var camPos = new glMatrix.ARRAY_TYPE(3);
// var camTarget = new glMatrix.ARRAY_TYPE(3);
// var camUp = new glMatrix.ARRAY_TYPE(3);

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
function initWebGL(canvas){
    try{
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
    } catch (e){}
    if (!gl){
        alert("Could not initialise WebGL, sorry :-(");
    }
    
}

function initBuffers(){
    // Vertices
    squareVertexArrayBuffer = gl.createBuffer();
    squareIndexBuffer = gl.createBuffer();
    squareColorBuffer = gl.createBuffer();
    
    sphereVertexArrayBuffer = gl.createBuffer();
    sphereIndexBuffer = gl.createBuffer();
    sphereColorBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexArrayBuffer);
    var vertices = [
         10.0, -2,  10.0,
        -10.0, -2,  10.0,
         10.0, -2,  -10.0,
        -10.0, -2,  -10.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexArrayBuffer.itemSize = 3;
    squareVertexArrayBuffer.numItems = 4;
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    // Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
    var vertexIndices = [
        0, 1, 2,
        2, 3, 1
    ];
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    squareIndexBuffer.itemSize = 1;
    squareIndexBuffer.numItems = 6;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
    var colors = [
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 1, 0, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareColorBuffer.itemSize = 4;
    squareColorBuffer.numItems = 4;
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    var sphereVertices = [], sphereIndices = [], sphereColors = [];
    sphereVertices = Object(sphereVertices);
    sphereIndices = Object(sphereIndices);
    sphereColors = Object(sphereColors);
    icoSphere(sphereVertices, sphereIndices, sphereColors, 4);
    sphereVertices = sphereVertices.valueOf;
    sphereIndices = sphereIndices.valueOf;
    sphereColors = sphereColors.valueOf;
    
    var msg = "nbVertices : "+ sphereVertices.nbVertices + " nbTriangles : " + sphereIndices.nbTriangles;
    disp("ok");
    // Sphere Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexArrayBuffer);
    // var sphereVertices = icosahedronVertices();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);
    sphereVertexArrayBuffer.itemSize = 3;
    sphereVertexArrayBuffer.numItems = sphereVertices.nbVertices;
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
    // var sphereIndices = icosahedronIndices();
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
    sphereIndexBuffer.itemSize = 1;
    sphereIndexBuffer.numItems = sphereIndices.nbTriangles*3;
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereColorBuffer);
    // var sphereColors = icosphereColors(0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereColors), gl.STATIC_DRAW);
    sphereColorBuffer.itemSize = 4;
    sphereColorBuffer.numItems = sphereColors.nbColors;
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // var msg = "";
    // for(var i = 0 ; i < sphereIndices.nbTriangles*3 ; i ++){
        // msg+= " " + sphereIndices[i];
    // }
    // for(var i = 0 ; i < sphereVertices.nbVertices*3 ; i ++){
        // console.log(sphereVertices[i]+" "+i);
    // }
    // alert(msg);
}

function handleKeyDown(event) {
    var content = document.getElementById('content');
    if (event.keyCode == 40) {
        disp("ok");
    }
}

function drawScene(){
    
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexArrayBuffer);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexArrayBuffer.numItems);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexArrayBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
    
    gl.drawElements(gl.TRIANGLES, squareIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexArrayBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
    gl.drawElements(gl.TRIANGLES, sphereIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function nextFrame(){
    
    mat4.rotate(modelMatrix, degToRad(1), [0.0, 1.0, 0.0]);
    
    updateNormalMatrix();
    
    setMVUniforms();
    
}
function tick(){
    
    requestAnimFrame(tick);
    drawScene();
    
    nextFrame();
}

function start(){
    
    var canvas = document.getElementById("canvas");
    initWebGL(canvas);
    initShaders();
    initBuffers();
    initUniforms();
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
    document.onkeydown = handleKeyDown;
    tick();
}