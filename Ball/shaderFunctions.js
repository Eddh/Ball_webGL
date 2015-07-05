// shaderFunctions.js

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript){
        return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while (k){
        if (k.nodeType == 3){
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    var shader;
    if (shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if (shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else{
        return null;
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader)+id);
        return null;
    }
    return shader;
}

function initShaders(){
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);
    
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    // shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.modelMatrixUniform = gl.getUniformLocation(shaderProgram, "uModel");
    shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, "uView");
    shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.lightDirUniform = gl.getUniformLocation(shaderProgram, "uLightDir");
    
}
function initUniforms(){
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    
    mat4.identity(modelMatrix);
    
    
    mat4.identity(viewMatrix);
    mat4.translate(viewMatrix, [0, 0, -8]);
    
    // mat4.identity(mvMatrix);
    // mat4.translate(mvMatrix, [0, 0, -8]);
    
    
    
    // var msg = " ";
    // for(var i = 0 ; i < 16 ; i++){
        // msg += " "+mvMatrix[i]+" ";
    // }
    // alert(msg);
    mat4.multiply(viewMatrix, modelMatrix, mvMatrix);
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, normalMatrix);
    gl.uniform3fv(shaderProgram.lightDirUniform, lightDir);
}
function setMVUniforms(){
    // gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelMatrixUniform, false, modelMatrix);
    gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, normalMatrix);
}
function setLightDirUniform(){
    gl.uniform3fv(shaderProgram.lightDirUniform, lightDir);
}
function updateNormalMatrix(){
    mat4.multiply(viewMatrix, modelMatrix, mvMatrix);
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
}