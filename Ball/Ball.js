// Ball.js

var gl;
var shaderProgram;
var squareVertexArrayBuffer;
var squareIndexBuffer;
var sphereVertexArrayBuffer;
var sphereIndexBuffer;
var sphereColorBuffer;
var sphereMvMatrix = mat4.create();
var squareMvMatrix = mat4.create();

var sphereModelMatrix = mat4.create();
var botSphereModelMatrix = mat4.create();
var squareModelMatrix = mat4.create();

var pMatrix = mat4.create();
var normalMatrix = mat3.create();
var botNormalMatrix = mat3.create();
var squareNormalMatrix = mat3.create();
var lightDir = vec3.normalize([1, 1, 1]);
var nbSubdivs = 2;
var nbTriangles;
var vYSphere = 0;
var ySphere = 3;
var camPos = vec3.create(new Array(0, 2, 8));
var camTarget = vec3.create([0, 2, 0]);
var camDirection = vec3.create();
var camUp = vec3.create([0, 1, 0]);
var camRight = vec3.create();
var viewMatrix = mat4.create();
var camYaw = -90;
// var camPos = new glMatrix.ARRAY_TYPE(3);
// var camTarget = new glMatrix.ARRAY_TYPE(3);
// var camUp = new glMatrix.ARRAY_TYPE(3);

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
function initWebGL(canvas){
    gl = null;
    try{
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
    } catch (e){}
    if (!gl){
        alert("Could not initialise WebGL, sorry :-(");
    }
    var ret = gl.getExtension("OES_element_index_uint");
    if(ret == null){
        alert("could not get Extension OES_element_index_uint");
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
         10.0, 0,  10.0,
        -10.0, 0,  10.0,
         10.0, 0,  -10.0,
        -10.0, 0,  -10.0
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
        0.5, 0.5, 0.5, 1,
        0.5, 0.5, 0.5, 1,
        0.5, 0.5, 0.5, 1,
        0.5, 0.5, 0.5, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareColorBuffer.itemSize = 4;
    squareColorBuffer.numItems = 4;
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    bufferIcosphere(nbSubdivs);
    var msg  = "nbSubdivs : "+nbSubdivs+"</br> nbTriangles : " + nbTriangles;
    display(msg);
}

function handleKeyDown(event){
    var content = document.getElementById('content');
    if (event.keyCode == 40){
        if(nbSubdivs > 0){
            nbSubdivs--;
            bufferIcosphere(nbSubdivs);
        }
    }
    if(event.keyCode == 38){
        if(nbSubdivs < 6){
            nbSubdivs++;
            bufferIcosphere(nbSubdivs);
        }
    }
    if(event.keyCode == 90){
        camPos = vec3.add(camPos, camDirection, camPos);
    }
    if(event.keyCode == 83){
        camPos = vec3.subtract(camPos, camDirection, camPos);
    }
    if(event.keyCode == 81){
        camPos = vec3.add(camPos, camRight, camPos);
    }
    if(event.keyCode == 68){
        camPos = vec3.subtract(camPos, camRight, camPos);
    }
    if(event.keyCode == 65){
        camYaw -= 2;
    }
    if(event.keyCode == 69){
        camYaw += 2;
    }
    camDirection[0] = Math.cos(degToRad(camYaw));
    camDirection[2] = Math.sin(degToRad(camYaw));
    camRight = vec3.normalize(vec3.cross(camUp, camDirection, camRight));
    mat4.lookAt(camPos, vec3.add(camDirection, camPos, camTarget), camUp, viewMatrix);
    gl.uniform3fv(shaderProgram.viewPosUniform, camPos);
    var msg  = "nbSubdivs : "+nbSubdivs+"</br> nbTriangles : " + nbTriangles;
    display(msg);
}
function handleKeyUp(event){
    
}

function drawScene(){
    
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexArrayBuffer);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexArrayBuffer.numItems);
    setMVUniformsSquare();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexArrayBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
    
    gl.drawElements(gl.TRIANGLES, squareIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
    setMVUniformsSphere();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexArrayBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexArrayBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
    gl.drawElements(gl.TRIANGLES, sphereIndexBuffer.numItems, gl.UNSIGNED_INT, 0);
}

function nextFrame(){
    if(ySphere > 0.6){
        vYSphere -= 0.0010;
    }
    else{
       vYSphere = 0.07; 
    }
    
    ySphere += vYSphere;
    mat4.rotate(sphereModelMatrix, degToRad(1), [0.0, 1.0, 0.0]);
    mat4.translate(sphereModelMatrix, [0.0, vYSphere, 0.0]);
    updateNormalMatrix();
    
}
function tick(){
    
    requestAnimFrame(tick);
    drawScene();
    
    nextFrame();
}

function start(){
    
    
    
    var canvas = document.getElementById("canvas");

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    
    initWebGL(canvas);
    initShaders();
    initBuffers();
    initUniforms();
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    tick();
}